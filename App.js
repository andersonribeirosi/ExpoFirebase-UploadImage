import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Button, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import Firebase from 'firebase'
import * as ImagePicker from 'expo-image-picker'
import { firebaseConfig } from './firebase';

if (!Firebase.apps.length) {
  Firebase.initializeApp(firebaseConfig)
}

export default function App() {
  const [image, setImage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [urlUpload, setUrlUpload] = useState("")

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Desculpe, sem permissão para a acesso da galeria')
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

    // const ref = Firebase.storage().ref().child(new Date().toISOString() + '.jpg')
    const ref = Firebase.storage().ref().child("banner2" + '.jpg')
    const snapshot = ref.put(blob);

    snapshot.on(
      Firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        setUploading(true)
      },
      (error) => {
        setUploading(false)
        console.log(error);
        return
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          setUploading(false)
          setUrlUpload(url)
          console.log("download url: ", `${url}.jpg`);
          return url
        })
      }
    )
  }

  return (
    <SafeAreaView style={styles.container}>

      <View>{image && (<Image source={{ uri: urlUpload || image }} style={{ width: 1200, height: 300 }} />)}</View>
      <View style={{ marginTop: 20, }}>
        <Button title="ESCOLHA A IMAGEM" onPress={pickImage} />
      </View>
      {!uploading ? <>
        <View style={{ marginTop: 10 }}>
          <Button title="upload" onPress={uploadImage} />
        </View> </> : <View><ActivityIndicator style={{ marginTop: 10 }} size="large" color="#000" /></View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 1200,
    marginHorizontal: 16,
    alignSelf: 'center',
  },
});