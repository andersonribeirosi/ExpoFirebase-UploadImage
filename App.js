import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button, Platform, ActivityIndicator } from 'react-native';
import Firebase from 'firebase'
import * as ImagePicker from 'expo-image-picker'
import { firebaseConfig } from './firebase';

export default function App() {

  if (!Firebase.apps.length) {
    Firebase.initializeApp(firebaseConfig)
  }

  const [image, setImage] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Desculpe, sem permissão para a câmera')
        }
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.all,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    })
    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri)
    }
  }

  const uploadImage = async () => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.responseType = 'blob';
      xhr.open('GET', image, true);
      xhr.send(null);
    });

    const ref = Firebase.storage().ref().child(new Date().toISOString() + '.jpg')
    const snapshot = ref.put(blob);

    snapshot.on(
      Firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        setUploading(true)
      },
      (error) => {
        setUploading(false)
        console.log(error);
        // blob.close();
        return
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          setUploading(false)
          console.log("download url: ", `${url}.jpg`);
          // blob.close()
          return url
        })
      }
    )
  }


  return (
    <View style={styles.container}>
      <View >
        <Image source={{ uri: image }} style={{ width: 600, height: 300 }} />
        <Button title="ESCOLHA A IMAGEM" onPress={pickImage} />
        {!uploading ? <Button title="upload" onPress={uploadImage} /> : <ActivityIndicator size="large" color="#000" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: 300,
    // backgroundColor: 'grey',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
});
