<template>
  <!-- This dialog allows the user to report the book if missing -->
  <v-card class="elevation-12">
    <v-toolbar color="primary" dark flat>
      <v-spacer></v-spacer>
      <!-- Displays the title of the dialog -->
      <v-toolbar-title style="font-size: 2em;">
        Report Book as Missing
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-card-text class="text-center">
      <!-- Shows a small disclaimer to have the user make sure it is
      missing -->
      <p style="font-size: 1.5em; line-height: 35px;">
        This will remove <strong>"{{ bookInformation.Title }}"</strong> from the
        catalog. Please ensure that the book is truly absent. This will not
        deduct any tokens from your account.
      </p>
    </v-card-text>
    <v-card-actions>
      <!-- Shows the cancel button and the accept button to allow the user to
      either exit or report the book -->
      <v-btn color="grey" v-on:click="$emit('close-dialog')">Cancel</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submitReport()">Report</v-btn>
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
  name: "ReportDialog",
  data: function() {
    return {
      notificationText: "",
      snackbar: false,
    };
  },
  props: {
    // Requires the book information so it can submit a request to report
    // the specific ISBN
    bookInformation: {
      type: Object,
      required: true,
    },
  },
  methods: {
    // Sends a request to the backend, which interacts with the blockchain, to
    // remove the book and set its quantity to zero
    submitReport: function() {
      //TODO integrate this with backend
      const component = this;
      fetch("http://localhost:3000/api/books/report/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isbn: this.bookInformation.ISBN,
        }),
      })
        .then(function(response) {
          response.json().then(function(data) {
            // Sets the quantity of the book to zero and 
            // closes the dialog
            console.log(data);
            component.bookInformation.Quantity = 0;
            component.notify(data);
            component.$emit("close-dialog");
          });
        })
        .catch((error) => {
          console.log(error);
          component.notificationText =
            "An error occurred. Please reload the page.";
          component.snackbar = true;
        });
    },
    // Nofities the user with the provided text
    notify: function(text) {
      this.snackbar = true;
      this.notificationText = text;
    },
  },
};
</script>
