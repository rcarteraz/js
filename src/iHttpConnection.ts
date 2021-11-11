import { Types } from "./index.js";
import { LogRecord_Level } from "./generated/mesh.js";
import { IMeshDevice } from "./iMeshDevice.js";
import type { HTTPConnectionParameters } from "./types.js";
import { typedArrayToBuffer } from "./utils/general.js";
import { log } from "./utils/logging.js";

/**
 * Allows to connect to a Meshtastic device over HTTP(S)
 */
export class IHTTPConnection extends IMeshDevice {
  /**
   * URL of the device that is to be connected to.
   */
  url: string | undefined;

  /**
   * Enables receiving messages all at once, versus one per request
   */
  receiveBatchRequests: boolean | undefined;

  constructor() {
    super();

    this.url = undefined;

    this.receiveBatchRequests = false;
  }

  /**
   * Initiates the connect process to a Meshtastic device via HTTP(S)
   * @param parameters http connection parameters
   */
  public async connect(parameters: HTTPConnectionParameters): Promise<void> {
    this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_CONNECTING);

    this.receiveBatchRequests = parameters.receiveBatchRequests;

    if (!this.url) {
      this.url = `${parameters.tls ? "https://" : "http://"}${
        parameters.address
      }`;
    }
    if (await this.ping()) {
      log(
        `IHTTPConnection.connect`,
        `Ping succeeded, starting configuration and request timer.`,
        LogRecord_Level.DEBUG
      );
      await this.configure();
      setInterval(
        () => {
          this.readFromRadio().catch((e: Error) => {
            log(`IHTTPConnection`, e.message, LogRecord_Level.ERROR);
          });
        },
        parameters.fetchInterval ? parameters.fetchInterval : 5000
      );
    } else {
      setTimeout(() => {
        void this.connect({
          address: parameters.address,
          fetchInterval: parameters.fetchInterval,
          receiveBatchRequests: parameters.receiveBatchRequests,
          tls: parameters.tls
        });
      }, 10000);
    }
  }

  /**
   * Disconnects from the Meshtastic device
   */
  public disconnect(): void {
    this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_DISCONNECTED);
    this.complete();
  }

  /**
   * Pings device to check if it is avaliable
   */
  public async ping(): Promise<boolean> {
    log(
      `IHTTPConnection.connect`,
      `Attempting device ping.`,
      LogRecord_Level.DEBUG
    );

    let pingSuccessful = false;

    await fetch(`${this.url}/hotspot-detect.html`, {})
      .then(() => {
        pingSuccessful = true;
        this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_CONNECTED);
      })
      .catch(({ message }: { message: string }) => {
        pingSuccessful = false;
        log(`IHTTPConnection.connect`, message, LogRecord_Level.ERROR);
        this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_RECONNECTING);
      });
    return pingSuccessful;
  }

  /**
   * Reads any avaliable protobuf messages from the radio
   */
  protected async readFromRadio(): Promise<void> {
    let readBuffer = new ArrayBuffer(1);

    while (readBuffer.byteLength > 0) {
      await fetch(
        `${this.url}/api/v1/fromradio?all=${
          this.receiveBatchRequests ? "true" : "false"
        }`,
        {
          method: "GET",
          headers: {
            Accept: "application/x-protobuf"
          }
        }
      )
        .then(async (response) => {
          this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_CONNECTED);

          readBuffer = await response.arrayBuffer();

          if (readBuffer.byteLength > 0) {
            await this.handleFromRadio(new Uint8Array(readBuffer, 0));
          }
        })
        .catch(({ message }: { message: string }) => {
          log(`IHTTPConnection.readFromRadio`, message, LogRecord_Level.ERROR);

          this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_RECONNECTING);
        });
    }
  }

  /**
   * Sends supplied protobuf message to the radio
   */
  protected async writeToRadio(data: Uint8Array): Promise<void> {
    await fetch(`${this.url}/api/v1/toradio`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-protobuf"
      },
      //@ts-ignore fetch polyfill
      body: typedArrayToBuffer(data)
    })
      .then(async () => {
        this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_CONNECTED);

        await this.readFromRadio().catch((e: Error) => {
          log(`IHTTPConnection`, e.message, LogRecord_Level.ERROR);
        });
      })
      .catch(({ message }: { message: string }) => {
        log(`IHTTPConnection.writeToRadio`, message, LogRecord_Level.ERROR);
        this.updateDeviceStatus(Types.DeviceStatusEnum.DEVICE_RECONNECTING);
      });
  }
}
