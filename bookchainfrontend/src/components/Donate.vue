<template>
   <!-- 
     This is the donate dialog. It allows a user to donate a book 
     from their collection to the blockchain.
   -->
  <v-card class="elevation-12">
    <!-- The title for the card -->
    <v-toolbar color="primary" dark flat>
      <v-spacer></v-spacer>
      <v-toolbar-title style="font-size: 2em;">Donate Book</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
        <!-- Where the user enters the ISBN and their private key to send to the backend -->
    <v-card-text class="text-center">
      <div v-if="!isbn_prop">
        <h2 class="mt-3">Enter ISBN and Private Key</h2>
        <v-form>
          <v-text-field
            v-model="isbn"
            label="ISBN"
            name="donate-isbn"
            prepend-icon="mdi-book-open-variant"
            type="text"
          ></v-text-field>
          <v-text-field
            v-model="private_key"
            label="Private Key"
            name="private-key"
            prepend-icon="mdi-key-variant"
            type="text"
          ></v-text-field>
        </v-form>
      </div>
      <!-- If an ISBN is provided, then it just shows how much the book is worth along with 
      the ISBN. It only asks for the private key in this instance. -->
      <div v-if="isbn_prop">
        <h2 class="mt-3">Enter Private Key Pair</h2>
        <h3>ISBN: {{ isbn_prop }}</h3>
        <v-form>
          <v-text-field
            v-model="private_key"
            label="Private Key"
            name="private-key"
            prepend-icon="mdi-key-variant"
            type="text"
          ></v-text-field>
        </v-form>
      </div>
      <!-- This is a small disclaimer -->
      <p style="font-size: 1.5em; line-height: 35px;">
        By clicking accept below, I acknowledge I will be donating the book
        identified by the above ISBN Number. I will also receive
        {{ tokenAmount }} token(s).
      </p>
      <div style="display: inline">
        <h1 style="font-size: 4em;">
          {{ tokenAmount }}
          <v-icon size="100px" color="green">mdi-currency-usd</v-icon>
        </h1>
      </div>
    </v-card-text>
    <v-card-actions>
      <!-- These buttons allow the user to either send the
       ISBN and Key to the backend to donate a book or 
       for the user to exit the dialog
       -->
      <v-btn color="grey" v-on:click="$emit('close-dialog')">Cancel</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submitDonation()">Accept</v-btn>
    </v-card-actions>
    <v-snackbar v-model="snackbar">
      {{ this.notificationText }}
      <v-btn color="pink" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-card>
  <!-- </v-dialog> -->
</template>

<script>
export default {
  name: "Donate",
  data: function() {
    return {
      // ISBN and the key are required for the donation to work
      isbn: "",
      private_key: "",
      notificationText: "",
      snackbar: false
    };
  },
  props: {
    // If these are provided, only the private key is required for the 
    // donate to function. This will show the book and how much it is 
    // worth on the dialog
    tokenAmount: {
      type: Number,
      default: 1
    },
    isbn_prop: String
  },
  methods: {
    // This sends the appropriate ISBN to the submitDonationForISBN function
    // depending on if the ISBN was provided as a parameter to this component
    submitDonation: function() {
      // let self = this;
      if (this.isbn_prop) {
        this.submitDonationForISBN(this._props.isbn_prop);
      } else {
        this.submitDonationForISBN(this.isbn);
      }
    },
    // This sends the donate request to the back end. It will return successfully
    // if the ISBN is in the OpenLibrary database and the provided key is valid. 
    submitDonationForISBN: function(ISBN) {
      const component = this;
      fetch(
        "http://localhost:3000/api/books/donate/".concat(ISBN),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            privateKey: component.private_key,
          }),
        }
      )
        .then(function(response) {
          // Checks the response for an OK status code and
          // reloads the page if the book was added successfully
          // to show the book was added. 
          if (response.status === 200) { 
            console.log(response);
            response.json().then(function(data) {
              console.log('data: ', data);
              component.$emit("close-dialog");
              component.notify(data.message);
              window.location.reload();
            });
          }
        })
        .catch((error) => {
          // Logs the error to the console and then notifies the 
          // user if an error occurred
          console.log(error);
          component.notificationText =
            "An error occurred. Please reload the page.";
          component.snackbar = true;
        });
    },
    // Brings up a snackbar notification and displays the 
    // text provided to the function
    notify: function(text) {
      this.snackbar = true;
      this.notificationText = text;
    }
  }
};
</script>
