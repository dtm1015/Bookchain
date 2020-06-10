<template>
  <!-- This dialog allows the user to claim a book on the blockchain -->
  <v-content class="no-top-padding">
    <v-card class="elevation-12">
      <v-toolbar color="primary" dark flat>
        <v-spacer></v-spacer>
        <!-- The title of the dialog -->
        <v-toolbar-title style="font-size: 2em;">Claim Book</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text class="text-center">
        <!-- This shows the book title the user is trying to claim -->
        <h2 class="mt-3">
          Enter Your Private Key to claim "{{ bookInformation.Title }}".
        </h2>
        <v-form>
          <!-- Asks the user to enter their private key -->
          <v-text-field
            v-model="private_key"
            label="Private Key"
            name="private-key"
            prepend-icon="mdi-key-variant"
            type="text"
          ></v-text-field>
        </v-form>
        <!-- Shows a small disclaimer about how much the book costs to claim -->
        <p style="font-size: 1.5em; line-height: 35px;">
          By clicking accept below, I acknowledge I will be claiming the book
          identified above. I will also pay 1 token.
        </p>
      </v-card-text>
      <v-card-actions>
        <!-- Allows the user to either close the dialog or submit the claim -->
        <v-btn color="grey" v-on:click="$emit('close-dialog')">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="submitClaim()">Accept</v-btn>
      </v-card-actions>
      <v-snackbar v-model="snackbar">
        {{ this.notificationText }}
        <v-btn color="pink" text @click="snackbar = false">
          Close
        </v-btn>
      </v-snackbar>
    </v-card>
  </v-content>
  <!-- </v-dialog> -->
</template>

<script>
export default {
  name: "Donate",
  data: function() {
    return {
      isbn: "",
      private_key: "",
      notificationText: "",
      snackbar: false,
    };
  },
  props: {
    // The information for the book such as isbn and title are included in here
    // for correctly processing the claim request
    bookInformation: Object,
  },
  methods: {
    // This submits the claim to the backend. It interacts with the blockchain
    // and withdraws one token in exchange for the book
    submitClaim: function() {
      //TODO integrate this with backend
      const component = this;
      fetch(
        "http://localhost:3000/api/books/".concat(
          encodeURI(this.bookInformation.ISBN)
        ),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            privateKey: component.private_key,
            quantity: component.bookInformation.Quantity - 1,
            actionType: "retrieve",
          }),
        }
      )
        .then(function(response) {
          if (response.status === 200) {
            response.json().then(function(data) {
              if (data.message === "Book was updated successfully.") {
                component.bookInformation.Quantity =
                  component.bookInformation.Quantity - 1;
                component.$emit("close-dialog");
              } else {
                component.notify(data.message);
              }
            });
          }
        })
        .catch((error) => {
          console.log(error);
          component.notificationText =
            "An error occurred. Please reload the page.";
          component.snackbar = true;
        });
    },
    // Brings up a snackbar that displays the provided text
    notify: function(text) {
      this.snackbar = true;
      this.notificationText = text;
    },
  },
};
</script>

<style scoped>
.no-top-padding {
  padding-top: 0 !important;
  padding-left: 0 !important;
}
</style>
