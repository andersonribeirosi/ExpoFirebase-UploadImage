import { StyleSheet } from 'react-native'
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#fff",
    paddingTop: 20
 },
 images:{
  width:"100%",
  flexDirection:"row",
  justifyContent:"space-between",
  marginTop:5
 },
 deleteRefImage:{
   justifyContent:"center",
   paddingLeft:15,
 },
 descriptionImage:{
  width:"75%",
  alignContent:"flex-start",
  backgroundColor:"#f5f5f5cf",
  padding:12,
  paddingHorizontal: 20,
  borderRadius:10,
  marginBottom: 5,
  marginRight:15,
  color:"#282b2db5",
 },
 iconButton:{
  color:"#ffffff",
  fontSize:25,
  fontWeight:"bold",
 },
});
 
export default styles