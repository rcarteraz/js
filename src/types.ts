import type {
  IBLEConnection,
  IHTTPConnection,
  ISerialConnection,
  Protobuf
} from "./index.js";

export enum DeviceStatusEnum {
  DEVICE_RESTARTING,
  DEVICE_DISCONNECTED,
  DEVICE_CONNECTING,
  DEVICE_RECONNECTING,
  DEVICE_CONNECTED,
  DEVICE_CONFIGURING,
  DEVICE_CONFIGURED
}

export type ConnectionParameters =
  | HTTPConnectionParameters
  | BLEConnectionParameters
  | SerialConnectionParameters;

export interface HTTPConnectionParameters {
  /** Address The IP Address/Domain to connect to, without protocol */
  address: string;
  /**
   * Enables transport layer security. Notes: Slower, devices' certificate must
   * be trusted by the browser
   */
  tls?: boolean;
  /** Enables receiving messages all at once, versus one per request */
  receiveBatchRequests?: boolean;
  /**
   * (ms) Sets a fixed interval in that the device is fetched for new messages,
   * defaults to 5 seconds
   */
  fetchInterval: number;
}

export interface BLEConnectionParameters {
  /** Optional filter options for the web bluetooth api requestDevice() method */
  deviceFilter?: RequestDeviceOptions;
  /** Connect directly to a Bluetooth deivce, obtained from `getDevices()` */
  device?: BluetoothDevice;
}

export interface SerialConnectionParameters {
  baudRate?: number;
  /** Connect directly to a Serial port, obtained from `getPorts()` */
  port?: SerialPort;
  concurrentLogOutput: boolean;
}

export type LogEventPacket = LogEvent & { date: Date };

export interface NodeInfoPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.NodeInfo;
}

export interface UserPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.User;
}

export interface RoutingPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.Routing;
}

export interface PositionPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.Position;
}

export interface MessagePacket {
  packet: Protobuf.MeshPacket;
  text: string;
}

export interface PingPacket {
  packet: Protobuf.MeshPacket;
  data: Uint8Array;
}

export interface IpTunnelPacket {
  packet: Protobuf.MeshPacket;
  data: Uint8Array;
}

export interface SerialPacket {
  packet: Protobuf.MeshPacket;
  data: Uint8Array;
}

export interface StoreForwardPacket {
  packet: Protobuf.MeshPacket;
  data: Uint8Array;
}

export interface RangeTestPacket {
  packet: Protobuf.MeshPacket;
  data: Uint8Array;
}

export interface TelemetryPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.Telemetry;
}

export interface PrivatePacket {
  packet: Protobuf.MeshPacket;
  data: Uint8Array;
}

export interface AtakPacket {
  packet: Protobuf.MeshPacket;
  data: Uint8Array;
}

export interface RemoteHardwarePacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.HardwareMessage;
}

export interface ChannelPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.Channel;
}

export interface ConfigPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.Config;
}

export interface ModuleConfigPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.ModuleConfig;
}

export interface DeviceMetadataPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.DeviceMetadata;
}

export interface WaypointPacket {
  packet: Protobuf.MeshPacket;
  data: Protobuf.Waypoint;
}

export enum EmitterScope {
  "iMeshDevice",
  "iSerialConnection",
  "iNodeSerialConnection",
  "iBleConnection",
  "iHttpConnection"
}

export enum Emitter {
  "constructor",
  "sendText",
  "sendWaypoint",
  "sendPacket",
  "sendRaw",
  "setConfig",
  "setModuleConfig",
  "confirmSetConfig",
  "setOwner",
  "setChannel",
  "confirmSetChannel",
  "clearChannel",
  "getChannel",
  "getAllChannels",
  "getConfig",
  "getModuleConfig",
  "getOwner",
  "configure",
  "handleFromRadio",
  "handleMeshPacket",
  "connect",
  "ping",
  "readFromRadio",
  "writeToRadio",
  "setDebugMode",
  "getMetadata",
  "resetPeers"
}

export interface LogEvent {
  scope: EmitterScope;
  emitter: Emitter;
  message: string;
  level: Protobuf.LogRecord_Level;
  packet?: Uint8Array;
}

export enum ChannelNumber {
  PRIMARY,
  CHANNEL1,
  CHANNEL2,
  CHANNEL3,
  CHANNEL4,
  CHANNEL5,
  CHANNEL6,
  ADMIN
}

export type ConnectionType =
  | IBLEConnection
  | IHTTPConnection
  | ISerialConnection;
