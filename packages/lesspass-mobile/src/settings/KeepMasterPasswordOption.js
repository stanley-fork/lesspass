import React, { Component } from "react";
import { View } from "react-native";
import { Button, Portal, Dialog, List, Text, Switch } from "react-native-paper";
import MasterPassword from "../password/MasterPassword";
import { useTranslation } from "react-i18next";

export default class KeepMasterPasswordOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      masterPassword: "",
    };
  }

  _hideModal = () => {
    this.setState({ showModal: false });
  };

  _showModal = (value) => {
    const { onClear } = this.props;
    if (value) {
      onClear();
    } else {
      this.setState({ showModal: true });
    }
  };

  render() {
    const { showModal, masterPassword } = this.state;
    const { label, description, onOk, modalTitle, modalDescription, value } =
      this.props;
    const { t } = useTranslation();
    return (
      <View>
        <Portal>
          <Dialog onDismiss={this._hideModal} visible={showModal}>
            <Dialog.Title>{modalTitle}</Dialog.Title>
            <Dialog.ScrollArea style={{ maxHeight: 170, paddingHorizontal: 0 }}>
              <View style={{ padding: 10 }}>
                <MasterPassword
                  label={t("PasswordProfile.MasterPassword")}
                  masterPassword={masterPassword}
                  onChangeText={(value) =>
                    this.setState({ masterPassword: value })
                  }
                />
                {modalDescription ? <Text>{modalDescription}</Text> : null}
              </View>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button primary onPress={this._hideModal}>
                Cancel
              </Button>
              <Button
                primary
                onPress={() =>
                  this.setState({ showModal: false }, () =>
                    onOk(masterPassword),
                  )
                }
              >
                Ok
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <List.Item
          title={label}
          description={description}
          right={() => (
            <Switch
              value={value}
              onValueChange={() => this._showModal(value)}
            />
          )}
          onPress={() => this._showModal(value)}
        />
      </View>
    );
  }
}
