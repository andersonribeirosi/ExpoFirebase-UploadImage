import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Button, Platform, ActivityIndicator, SafeAreaView, FlatList, Text } from 'react-native';
import Firebase from 'firebase'
import * as ImagePicker from 'expo-image-picker'
import { firebaseConfig } from './firebase';
import styles from './style/style'
import Feather from 'react-native-vector-icons/Feather'

if (!Firebase.apps.length) {
  Firebase.initializeApp(firebaseConfig)
}

const firebaseDb = Firebase.firestore()

export default function App() {
  const [image, setImage] = useState("")
  const [uploadUrl, setUploadUrl] = useState("")
  const [uploadImageTmp, setUploadImageTmp] = useState([])
  const [dataList, setDataList] = useState([])
  const [showProgress, setShowProgress] = useState(false)

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
    listImages()
  }, []);

  const listImages = () => {
    firebaseDb.collection('Images').onSnapshot(query => {
      const list = [];
      query.forEach(doc => {
        list.push({ ...doc.data(), id: doc.id });
      });
      setDataList(list);
      console.log('Lista:', dataList);
    });
  }

  const deleteImage = (id) => {
    firebaseDb.collection('Images').doc(id).delete();
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
    const ref = Firebase.storage().ref().child("banner5" + '.jpg')
    const snapshot = ref.put(blob);

    snapshot.on(
      Firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        setShowProgress(true)
      },
      (error) => {
        setShowProgress(false)
        console.log(error);
        return
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          setShowProgress(false)
          setUploadUrl(url)
          uploadImageTmp.push(url)

          let imageFilter = dataList?.filter(s => s.domain === "mixbet.com.br")[0]
          if (!imageFilter)
            firebaseDb.collection('Images').add({
              domain: "mixbet.com.br",
              link: url
              // link: uploadImageTmp
            })
          else {
            firebaseDb.collection('Images').doc(imageFilter.id).update({
              domain: "mixbet.com.br",
              link: uploadImageTmp
            });
          }

          console.log("download url: ", `${url}.jpg`);

          return url
          // return uploadImageTmp
        })
      }
    )
  }

  return (
    <SafeAreaView style={stylesContainer.container}>
      <View>{uploadUrl || image ? (<Image source={{ uri: uploadUrl || image }} style={{ height: 300 }} />) : <></>}</View>
      <View style={{ marginTop: 20, }}>
        <Button title="Selecione a imagem" onPress={pickImage} />
      </View>
      {!showProgress ? <Button title="upload" onPress={uploadImage} /> :
        <ActivityIndicator style={{ marginTop: 10 }} size="large" color="#000" />}
      {/* <Button title="Listar Imagens" onPress={listImages}></Button> */}

      <View>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={dataList}
          renderItem={({ item }) => {
            return (
              <View style={styles.Tasks}>
                <TouchableOpacity
                  style={styles.deleteTask}
                  onPress={() => {
                    deleteImage(item.id);
                  }}>
                  <Feather
                    name="trash"
                    size={23}
                    color="grey"></Feather>
                </TouchableOpacity>
                <Text
                  style={styles.DescriptionTask}
                  onPress={() =>
                    navigation.navigate('settings-detail', {
                      id: item.id,
                      description: item.description,
                    })
                  }>
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