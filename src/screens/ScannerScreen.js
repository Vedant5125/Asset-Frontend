// Update your ScannerScreen.js imports
import { CameraView, useCameraPermissions } from 'expo-camera';
// Remove: import { BarCodeScanner } from 'expo-barcode-scanner';

// Update the component:
const ScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    // Handle the scanned data
    console.log(data);
  };

  if (!permission) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View>
        <Text>No access to camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <CameraView
      style={styles.camera}
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: ["qr", "pdf417", "aztec", "code128"],
      }}
    >
      {/* Your existing overlay UI */}
    </CameraView>
  );
};