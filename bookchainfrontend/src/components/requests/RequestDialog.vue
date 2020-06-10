<template>
  <v-dialog v-model="dialog" width="500px">
    <template v-slot:activator="{ on }">
      <v-btn color="primary" dark v-on="on">Request book</v-btn>
    </template>
    <v-card>
      <v-card-title>
        Request Book
      </v-card-title>
      <v-form class="d-flex justify-center">
        <div class="d-block">
          <div class="d-flex justify-center">
            <v-text-field
              :rules="[rules.checkISNB, rules.required]"
              outlined
              label="ISBN"
              v-model="isbn"
            ></v-text-field>
          </div>
          <div class="d-flex justify-center">
            <v-text-field
              :rules="[rules.required]"
              outlined
              label="Token Payment"
              type="number"
              v-model="tokens"
            ></v-text-field>
          </div>
          <div class="d-flex justify-center">
            <v-text-field
              :rules="[rules.required]"
              outlined
              label="Private key"
              v-model="privateKey"
            ></v-text-field>
          </div>
          <div class="d-flex justify-center">
            <v-text-field
              :rules="[rules.email]"
              outlined
              label="Notification Email (Optional)"
              v-model="email"
            ></v-text-field>
          </div>
          <div class="d-flex justify-space-around pa-5">
            <v-btn @click="dialog = false">Close</v-btn>
            <v-btn @click="submitRequest()">Submit</v-btn>
          </div>
        </div>
      </v-form>
    </v-card>
    <v-snackbar :timeout="5000" v-model="snackbar">
      {{ this.notificationText }}
    </v-snackbar>
  </v-dialog>
</template>

<script>
export default {
  //pop up to request a book

  name: "RequestDialog",
  //field values
  data: () => ({
    dialog: false,
    isbn: "",
    tokens: 0,
    email: "",
    privateKey: 0,
    notificationText: "",
    snackbar: false,
    //form rules
    rules: {
      email: (value) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      },
      checkISNB: (value) => {
        return (parseInt(value) != null && value.length === 13) || "Required";
      },
      required: (value) => !!value || "Required.",
    },
  }),
  methods: {
    //use api to create request
    async submitRequest() {
      const email = this.rules.email(this.email) || this.email === "";
      //if isbn, tokens and email are valid post to server
      if (this.rules.checkISNB(this.isbn) && this.tokens > 0 && email) {
        const data = {
          isbn: this.isbn,
          investment: this.tokens,
          privateKey: this.privateKey,
        };
        const response = await fetch("http://localhost:3000/api/requests", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        //on success create email notification for user if they filled in email field
        if (response.status === 200) {
          const request = await response.json();
          console.log(request);
          this.$emit("newRequest", request);
          if (this.rules.email(this.email)) {
            await fetch("http://localhost:3000/api/emails", {
              method: "POST",
              body: JSON.stringify({
                Request_ID: request["Request_ID"],
                Email_address: this.email,
              }),
            });
          }
          this.snackbar = true;
          this.notificationText = "Request added !";
        } else {
          this.snackbar = true;
          this.notificationText = "There was an error adding your request";
        }
      }
    },
  },
};
</script>

<style scoped>

</style>
