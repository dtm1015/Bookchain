<template>
  <v-navigation-drawer app class="d-flex">
    <div class="d-flex justify-center">
      <v-icon size="4em">mdi-library</v-icon>
    </div>
    <v-divider></v-divider>
    <div class="d-block">
      <div class="nav-btn">
        <v-btn to="/">Catalog</v-btn>
      </div>
      <div class="nav-btn">
        <v-btn to="/requests">Requests</v-btn>
      </div>
      <div class="nav-btn">
        <v-dialog v-model="donate_book_dialog" max-width="1000px">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on">
              Donate Book
            </v-btn>
          </template>

          <Donate v-bind:token-amount="1" v-on:close-dialog="closeDialogs()" />
        </v-dialog>
      </div>
      <div class="nav-btn">
        <v-btn @click="generateKey()">Generate Private Key</v-btn>
      </div>
      <div class="nav-btn" v-if="newPrivateKey !== ''">
        <p>New Private Key:</p>
      </div>
      <div class="nav-btn" v-if="newPrivateKey !== ''">
        <p class="key">{{ newPrivateKey }}</p>
      </div>

      <v-text-field v-model="privateKey" append-outer-icon="mdi-send-lock" @keyup.enter="getBalance()" @click:append-outer="getBalance()" label="Private key"></v-text-field>

      <p class="text-center">
        Current Balance:
      </p>
      <p class="text-center">
        {{ this.balance }} tokens <v-icon>mdi-book-open-variant</v-icon>
      </p>
    </div>
  </v-navigation-drawer>
</template>

<script>
import Donate from "../Donate";

export default {
  //a side bar component for navigation, determining balance of a key, generating a key, and donating a book

  name: "SideNav",
  components: {
    Donate,
  },
  data() {
    return {
      balance: 0,
      donate_book_dialog: false,
      notificationText: "",
      snackbar: false,
      newPrivateKey: "",
      privateKey: "",
    };
  },
  methods: {
    notify: function(text) {
      this.snackbar = true;
      this.notificationText = text;
    },
    closeDialogs: function() {
      this.donate_book_dialog = false;
      this.book_description_dialog = false;
      this.donate_book_dialog_multiple = false;
    },
    //generate new key
    generateKey: function() {
      const component = this;
      fetch("http://localhost:3000/api/books/key/new/", {
        method: "GET",
      })
        .then(function(response) {
          if (response.status === 200) {
            response.json().then(function(data) {
              console.log(data);
              component.newPrivateKey = data.privateKey;
              component.notify("Please copy your new key for re-use.");
            });
          } else {
            component.notify(
              "Something went wrong. Please refresh the page and try again."
            );
          }
        })
        .catch((error) => {
          console.log(error);
          component.notificationText =
            "An error occurred. Please reload the page.";
          component.snackbar = true;
        });
    },

    //get key balance
    async getBalance() {
      const resp = await fetch("http://localhost:3000/api/books/balance", {
        method: "POST",
        body: JSON.stringify({
          privateKey: this.privateKey
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      let bal = (await resp.json())["balance"];
      if (bal) {
        console.log(bal);
        this.balance = bal;
      }
      else {
        this.notify("Key not registered");
      }
    }
  },
};
</script>

<style scoped>
.nav-btn {
  padding: 10px;
  display: flex;
  justify-content: center;
}
.key {
  word-break: break-all;
}
</style>
