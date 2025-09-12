import React, { useEffect, useState, useRef } from "react";
import { View, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { generatePassword } from "./passwordGenerator";
import TextInput from "../ui/TextInput";
import { useDispatch, useSelector } from "react-redux";
import Counter from "./Counter";
import Options from "./Options";
import MasterPassword from "./MasterPassword";
import { NativeModules } from "react-native";
import { savePasswordProfile, updatePasswordProfile } from "./profilesActions";
import { cleanPasswordProfile } from "../profiles/profileActions";
import {
  isProfileValid,
  isLengthValid,
  isCounterValid,
  areOptionsValid,
} from "./validations";
import { Button, Snackbar, Text, Title, useTheme } from "react-native-paper";
import { addError, cleanErrors } from "../errors/errorsActions";
import SecondaryButton from "../ui/buttons/SecondaryButton";
import Styles from "../ui/Styles";
import { useTranslation } from "react-i18next";

function _getInitialState(settings) {
  return {
    id: null,
    site: "",
    login: settings.defaultPasswordProfileLogin,
    masterPassword: "",
    lowercase: settings.defaultLowercase,
    uppercase: settings.defaultUppercase,
    digits: settings.defaultDigits,
    symbols: settings.defaultSymbols,
    length: settings.defaultGeneratedPasswordLength,
    counter: settings.defaultCounter,
    copyPasswordAfterGeneration: settings.copyPasswordAfterGeneration,
    password: null,
  };
}
function _getPasswordProfile(state) {
  return {
    id: state.id,
    site: state.site,
    login: state.login,
    lowercase: state.lowercase,
    uppercase: state.uppercase,
    digits: state.digits,
    symbols: state.symbols,
    length: state.length,
    counter: state.counter,
  };
}

export default function PasswordGeneratorScreen() {
  const profile = useSelector((state) => state.profile);
  const settings = useSelector((state) => state.settings);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const ref_login = useRef();
  const ref_masterPassword = useRef();
  const [copied, setCopied] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [state, setState] = useState(() => _getInitialState(settings));
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const newState = _getInitialState(settings);
    if (profile === null) {
      setState({ ...newState });
    } else {
      setState({ ...newState, ...profile });
    }
  }, [settings, profile]);

  useEffect(() => {
    const passwordTimer = setTimeout(() => {
      if (state.password !== null) {
        setState({ ..._getInitialState(settings) });
      }
    }, 60 * 1000);
    return () => {
      clearTimeout(passwordTimer);
    };
  }, [state.password]);

  async function generate() {
    const passwordProfile = _getPasswordProfile(state);
    if (isProfileValid(passwordProfile)) {
      dispatch(cleanErrors());
      const password = await generatePassword(
        state.masterPassword,
        passwordProfile,
      );
      if (state.copyPasswordAfterGeneration) {
        NativeModules.LessPassClipboard.copy(password);
        setCopied(true);
      }
      setState((state) => ({ ...state, password }));
      Keyboard.dismiss();
    } else {
      dispatch(
        addError(
          t(
            "PasswordProfile.SiteRequired",
            "Password profile is invalid, cannot generate password. Site is required.",
          ),
        ),
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        ...Styles.container,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          gap: 10,
        }}
      >
        <View
          style={{
            gap: 5,
          }}
        >
          <TextInput
            label={t("PasswordProfile.Site")}
            value={state.site}
            autoFocus={true}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => ref_login.current.focus()}
            onChangeText={(site) => setState((state) => ({ ...state, site }))}
          />
          <TextInput
            label={t("PasswordProfile.Login")}
            value={state.login}
            outerRef={ref_login}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => ref_masterPassword.current.focus()}
            onChangeText={(login) => setState((state) => ({ ...state, login }))}
          />
          <MasterPassword
            label={t("PasswordProfile.MasterPassword")}
            masterPassword={state.masterPassword}
            outerRef={ref_masterPassword}
            onSubmitEditing={generate}
            onChangeText={(masterPassword) =>
              setState((state) => ({ ...state, masterPassword }))
            }
          />
        </View>
        <Options
          options={{
            lowercase: state.lowercase,
            uppercase: state.uppercase,
            digits: state.digits,
            symbols: state.symbols,
          }}
          areOptionsValid={areOptionsValid}
          onOptionsChange={(options) => {
            setState((state) => ({ ...state, ...options }));
          }}
        />
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <Counter
            label={t("PasswordProfile.Length")}
            value={state.length}
            setValue={(length) => setState((state) => ({ ...state, length }))}
            isValueValid={isLengthValid}
          />
          <Counter
            label={t("PasswordProfile.Counter")}
            value={state.counter}
            setValue={(counter) => setState((state) => ({ ...state, counter }))}
            isValueValid={isCounterValid}
          />
        </View>
        <View style={{ gap: 10 }}>
          <Button mode="contained" icon="cogs" onPress={generate}>
            {state.copyPasswordAfterGeneration
              ? t("PasswordProfile.GenerateAndCopy")
              : t("Common.Generate", "GENERATE")}
          </Button>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 5,
            }}
          >
            <SecondaryButton
              icon="refresh"
              onPress={() => {
                setSaved(false);
                setUpdated(false);
                setCopied(false);
                setSeePassword(false);
                dispatch(cleanErrors());
                setState(_getInitialState(settings));
                dispatch(cleanPasswordProfile());
              }}
            >
              {t("PasswordProfile.Clear")}
            </SecondaryButton>
            {state.password && state.copyPasswordAfterGeneration === false && (
              <SecondaryButton
                onPress={() => {
                  NativeModules.LessPassClipboard.copy(state.password);
                  setCopied(true);
                }}
                icon="clipboard"
              >
                {t("Common.Copy")}
              </SecondaryButton>
            )}
            {state.password && (
              <SecondaryButton
                onPress={() => {
                  setSeePassword((seePassword) => !seePassword);
                }}
                icon="eye"
              >
                {seePassword ? t("Common.Hide") : t("Common.Show")}
              </SecondaryButton>
            )}
            {state.password && auth.isAuthenticated ? (
              state.id === null ? (
                <SecondaryButton
                  onPress={() => {
                    const passwordProfile = _getPasswordProfile(state);
                    dispatch(savePasswordProfile(passwordProfile)).then(
                      (response) => {
                        setState((state) => ({
                          ...state,
                          ...response.data,
                        }));
                        setSaved(true);
                      },
                    );
                  }}
                  icon="content-save"
                >
                  {t("Common.Save")}
                </SecondaryButton>
              ) : (
                <SecondaryButton
                  onPress={() => {
                    const passwordProfile = _getPasswordProfile(state);
                    dispatch(updatePasswordProfile(passwordProfile)).then(
                      (response) => {
                        setState((state) => ({
                          ...state,
                          ...response.data,
                        }));
                        setUpdated(true);
                      },
                    );
                  }}
                  icon="content-save"
                >
                  {t("Common.Update", "UPDATE")}
                </SecondaryButton>
              )
            ) : null}
          </View>
          {state.password && seePassword && (
            <View>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "Hack",
                  marginTop: 20,
                }}
              >
                {state.password}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Snackbar
        visible={copied}
        onDismiss={() => setCopied(false)}
        action={{
          label: t("Common.Hide"),
          onPress: () => setCopied(false),
        }}
      >
        {t("Common.Copied")}
      </Snackbar>
      <Snackbar
        visible={saved}
        onDismiss={() => setSaved(false)}
        action={{
          label: t("Common.Hide"),
          onPress: () => setSaved(false),
        }}
      >
        {t("PasswordProfile.PasswordProfileSaved", "Password profile saved")}
      </Snackbar>
      <Snackbar
        visible={updated}
        onDismiss={() => setUpdated(false)}
        action={{
          label: t("Common.Hide"),
          onPress: () => setUpdated(false),
        }}
      >
        {t(
          "PasswordProfile.PasswordProfileUpdated",
          "Password profile updated",
        )}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}
