import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export default function Add({ navigation }) {
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [flip, setFlip] = useState(false);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");

      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const cameraFlip = () => {
    setType(
      type === Camera.Constants.Type.back //back camera
        ? Camera.Constants.Type.front //front camera
        : Camera.Constants.Type.back
    );
    if (image) {
      setFlip(true);
    }
  };

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setImage(data.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //Only Image files can be picked, if it is given All, it can pick all type of files
      allowsEditing: true, //allows cropping
      aspect: [4, 3],
      quality: 1, //medium quality, 0 means low and 2 means high quality here
    });
    //console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
    setFlip(false);
  };

  if (hasCameraPermission === null || hasGalleryPermission === false) {
    return <View />;
  }
  if (hasCameraPermission === false || hasGalleryPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      {image && !flip ? (
        <Image source={{ uri: image }} style={{ flex: 1 }} />
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={(ref) => setCamera(ref)}
            style={styles.fixedRatio}
            type={type}
            ratio={"1:1"} //size for camera aspect ratio
          />
        </View>
      )}
      <Button title="Flip Image" onPress={() => cameraFlip()}></Button>
      <Button title="Take Picture" onPress={() => takePicture()} />
      <Button title="Pick Image From Gallery" onPress={() => pickImage()} />
      <Button
        title="Next"
        onPress={() => navigation.navigate("Save", { image })}
        //passing image uri as an object to Save page
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    flexDirection: "row",
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1, //To keep camera container in square shape
  },
});
