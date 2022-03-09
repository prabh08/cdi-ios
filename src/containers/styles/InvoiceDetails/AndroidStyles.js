import {StyleSheet} from 'react-native';
import {vh, vw} from '../../../utilities/Dimensions';

const stylesAndroid = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  repeatOrderBtn: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#489CD6',
    color: '#489CD6',
    width: vw(80),
    borderRadius: 5,
  },
  itemContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(10),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  orderStatusContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(29),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  orderedItemsContainer: {
    width: vw(100),
    flexGrow: 1,
    marginBottom: 0,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  orderDate: {
    color: '#c2c2c2',
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  orderSubTotal: {
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 5,
    textAlign: 'right',
  },
  orderEntryLeft: {
    color: '#c2c2c2',
    fontWeight: 'bold',
    paddingVertical: 5,
    width: '45%',
  },
  orderEntryRight: {
    color: '#c2c2c2',
    fontWeight: 'bold',
    paddingVertical: 5,
    width: '55%',
  },
  orderEntryLeftBlack: {
    color: 'black',
    fontWeight: 'bold',
    paddingVertical: 5,
    width: '45%',
  },
  orderEntryRightBlack: {
    color: 'black',
    fontWeight: 'bold',
    paddingVertical: 5,
    width: '55%',
  },
  entryName: {
    fontSize: 18,
    color: '#489CD6',
    fontWeight: 'bold',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  entryContainer: {
    width: vw(100),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 10,
  },
});

export default stylesAndroid;
