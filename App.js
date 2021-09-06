import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Button, Platform, ActivityIndicator, SafeAreaView, FlatList, Text } from 'react-native';
import Firebase from 'firebase'
import * as ImagePicker from 'expo-image-picker'
import { firebaseConfig } from './firebase';
import styles from './style/style'
import Icon from 'react-native-vector-icons/FontAwesome'

if (!Firebase.apps.length) {
  Firebase.initializeApp(firebaseConfig)
}

const firebaseDb = Firebase.firestore()

export default function App() {
  const [image, setImage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [urlUpload, setUrlUpload] = useState("")
  const [imageList, setImageList] = useState([])

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

  useEffect(() => {
    firebaseDb.collection('Images').onSnapshot(query => {
      const list = [];
      query.forEach(doc => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setImageList(list);
      console.log('Lista:', list);
    });
  }, [])

  const deleteRefImageFirestore = (id) => {
    firebaseDb.collection('Images').doc(id).delete();
  }

  const deleteImgStorage = () => {
    const ref = Firebase.storage().ref('banner5.jpg');

    ref.delete()
      .then(() => {
        alert('Imagem excluída com sucesso')
      })
      .catch((deleteError) => {
        alert(deleteError)
      });
  }

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
    const ref = Firebase.storage().ref().child("banner4" + '.jpg')
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

          let imageFilter = imageList?.filter(s => s.domain === "mixbet.com.br")[0]
          if (!imageFilter)
            firebaseDb.collection('Images').add({
              domain: "mixbets.com.br",
              link: url
            })
          else {
            firebaseDb.collection('Images').doc(imageFilter.id).update({
              domain: "mixbets.com.br",
            });
          }

          console.log("download url: ", `${url}.jpg`);
          return url
        })
      }
    )
  }

  const downloadUrl = () => {
    const ref = Firebase.storage().ref('banner3.jpg');

    ref.getDownloadURL()
      .then((url) => {
        console.log(url);
      });
  }

  return (
    <SafeAreaView style={stylesContainer.container}>
      <View>{urlUpload || image ? (<Image source={{ uri: urlUpload || image }} style={{ height: 300 }} />) : <></>}</View>

      <View style={{ marginTop: 20, }}>
        <Button title="Selecione a imagem" onPress={pickImage} />
      </View>

      <View style={{ marginTop: 20 }}>
        {!uploading ? <Button title="upload" onPress={uploadImage} /> :
          <ActivityIndicator style={{ marginTop: 10 }} size="large" color="#000" />}
      </View>

      <View style={{ marginTop: 20, }}>
        <Button color={'orange'} title="Deletar imagem" onPress={deleteImgStorage} />
      </View>

      <View style={{ marginTop: 20, }}>
        <Button color={'green'} title="Download url" onPress={downloadUrl} />
      </View >

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginTop: 40, color: 'black', fontSize: 20, fontWeight: 'bold' }}> Lista de imagens (referências) - Firestore-Storage</Text>
      </View>

      <View style={{ marginTop: 40 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={imageList}
          renderItem={({ item }) => {
            return (
              <View style={styles.images}>
                <TouchableOpacity
                  style={styles.deleteRefImage}
                  onPress={() => {
                    deleteRefImageFirestore(item.id);
                  }}>
                  <Icon
                    name="trash"
                    size={23}
                    color="grey"></Icon>
                </TouchableOpacity>
                <Text style={styles.descriptionImage}>
                  {item.link}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const stylesContainer = StyleSheet.create({
  container: {
    flex: 1,
    width: 1200,
    marginHorizontal: 16,
    alignSelf: 'center',
  },
});