<template>
  <v-content class="no-top-padding">
    <v-card class="elevation-12 no-top-padding">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title style="font-size: 2em;"
          >Support request</v-toolbar-title
        >
      </v-toolbar>
      <v-card-text style="font-size:1em" class="pt-5 text-center"
        >Support the request for this ISBN:</v-card-text
      >
      <v-card-text style="color: black; font-size: 2em" class="text-center">
        {{ this.isbn }}
      </v-card-text>
      <v-card-text class="text-center" style="font-size: 1.5em"
        >Enter donation amount and Private key</v-card-text
      >
      <v-card-actions>
        <v-text-field
          type="number"
          v-model="donation"
          label="Donation"
          prepend-icon="mdi-currency-usd"
        ></v-text-field>
      </v-card-actions>
      <v-card-actions>
        <v-text-field
          v-model="privateKey"
          label="Private Key"
          prepend-icon="mdi-key-variant"
        ></v-text-field>
      </v-card-actions>
      <v-card-text class="text-center">
        <p>
          By clicking accept below, I acknowledge I will be donating to the
          request for the book identified by the above ISBN Number.
        </p>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn color="red lighten-2" dark style="" @click="donate()"
          >Donate</v-btn
        >
      </v-card-actions>

      <v-snackbar :timeout="5000" v-model="snackbar">
        {{ this.message }}
      </v-snackbar>
    </v-card>
  </v-content>
</template>

<script>
export default {
  //this component is used to support a request with an investment

  name: "DonateRequest",
  //isbn of the book to donate for.
  props: ["isbn"],

  data() {
    return {
      donation: 0,
      privateKey: "",
      snackbar: false,
      message: "",
    };
  },
  methods: {
    //user api to check that the user has appropriate balance and donate the book
    async donate() {
      //get balance
      let resp = await fetch("http://localhost:3000/api/books/balance", {
        method: "POST",
        body: JSON.stringify({
          privateKey: this.privateKey,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (resp.status === 500) {
        this.notify("Private Key not registered");
        this.donation = 0;
        this.privateKey = "";
        return;
      }

      //balance number
      const balance = parseInt((await resp.json())["balance"].split(" ")[0]);
      //check balance is valid
      if (balance < this.donation) {
        this.notify("Your balance is too low to donate that amount");
        this.donation = 0;
        this.privateKey = "";
        return;
      }
      //increase donation
      resp = await fetch(
        `http://localhost:3000/api/requests/increase/${this.isbn}`,
        {
          method: "PUT",
          body: JSON.stringify({
            privateKey: this.privateKey,
            Investment: parseInt(this.donation),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (resp.status === 500) {
        this.notify("There was an error supporting that request");
        this.donation = 0;
        this.privateKey = "";
        return;
      }
      //send the added amount to the parent component for display
      this.$emit("donate", parseInt(this.donation));
      this.donation = 0;
      this.privateKey = "";
    },
    notify(message) {
      this.snackbar = true;
      this.message = message;
    },
  },
};
</script>

<style scoped>
.no-top-padding {
  padding-top: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-bottom: 0 !important;
}
</style>
