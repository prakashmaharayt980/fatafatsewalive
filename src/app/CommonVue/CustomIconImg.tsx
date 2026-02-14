import { Battery, BatteryCharging, Bluetooth, CardSim, Cpu, Database, EthernetPort, Gpu, HandCoins, MemoryStick, Microchip, Monitor, PaintBucket, Shield, ShieldUser, Tv, Video, VideoOff, Wifi, Truck, RotateCcw, Smartphone, Tablet, Watch, Camera, WashingMachine, Refrigerator, Headphones, Printer, Plane, Drone, Laptop } from "lucide-react";

const iconMap = {
  battery: Battery,
  wlan: Wifi,
  bluetooth: Bluetooth,
  cpu: Cpu,
  gpu: Gpu,
  ram: Microchip,
  color: PaintBucket,
  video: Video,
  storage: Database,
  charging: BatteryCharging,
  rearcamera: VideoOff,
  sim: CardSim,
  networktechnology: EthernetPort,
  operatingsystem: Microchip,
  display: Monitor,
  processor: Cpu,
  // Add more key-icon pairs as needed
  frontcamera: Video,
  priceinnepal: HandCoins,
  protection: ShieldUser,
  warranty: Shield,
  sensors: Monitor,
  chipset: MemoryStick,
  resolution: Tv,
  delivery: Truck,
  return: RotateCcw,
  // Categories
  laptop: Laptop,
  mobilephone: Smartphone,
  smartphone: Smartphone,
  tablet: Tablet,
  watch: Watch,
  smartwatch: Watch,
  camera: Camera,
  tv: Tv,

  homeappliances: WashingMachine,
  refrigerator: Refrigerator,
  washingmachine: WashingMachine,
  accessories: Headphones,
  audio: Headphones,
  printer: Printer,
  drone: Drone,
};



const IconRenderer = ({ iconKey, size = 24, color = '#1967b3', className = '' }) => {

  const key = iconKey.toLowerCase().replace(/\s+/g, '');
  // Get the icon component from the map, default to MdError if key not found
  const IconComponent = iconMap[key] || Battery; // Default icon if key not found

  return <IconComponent size={size} color={color} className={className} />;
};

export default IconRenderer;