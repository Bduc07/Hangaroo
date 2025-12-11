import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const Login = () => {
  return (
    <View style={styles.Container}>
      <View style={styles.Top}>
        <Text style={styles.title}>Hangaroo</Text>
        <View style={styles.underline} />
      </View>
      <View style={styles.Box}>
        <View style={styles.LoginBox}></View>
        <View style={styles.PasswordBox}></View>

        <Text style={styles.Forget}>Forget password?</Text>
        <View style={styles.ForgetUnderline} />
        <View style={styles.SignInBox}>
          <Text style={styles.SignIn}>SignIn</Text>
        </View>
        <View style={styles.SignUpBox}>
          <Text style={styles.SignUp}>SignUp</Text>
        </View>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  Top: {
    marginTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  underline: {
    height: 4,
    backgroundColor: 'black',
    marginTop: 4,
    width: '100%',
  },
  Box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  LoginBox: {
    width: '80%',
    height: 50,
    borderWidth: 2,
    marginBottom: 20,
  },
  PasswordBox: {
    width: '80%',
    height: 50,
    borderWidth: 2,
  },
  Forget: {
    color: 'blue',
    textAlign: 'right',
    width: '80%',
    marginBottom: 30,
  },
  ForgetUnderline: {
    height: 2,
    width: 110,
    backgroundColor: 'blue',
    alignSelf: 'flex-end',
    marginTop: -30,
    marginRight: '10%',
  },
  SignInBox: {
    width: '25%',
    height: 50,
    borderWidth: 1,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgrey',
  },
  SignIn: {
    fontSize: 15,
  },
  SignUpBox: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgrey',
    position: 'absolute',
    bottom: 40,
  },
  SignUp: {
    fontSize: 15,
  },
});
