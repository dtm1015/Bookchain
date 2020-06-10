<template>
  <!-- This component retrieves a list of all books in the database and blockchain -->
  <v-content>
    <!-- Allows the user to search the available books by title -->
    <div class="d-flex justify-end">
      <v-row class="justify-end">
        <v-col cols="4" class="justify-end">
          <v-text-field
            v-model="query"
            label="Search available books"
            outlined
            append-outer-icon="mdi-magnify"
            v-on:keyup.enter="search()"
            @click:append-outer="search()"
          ></v-text-field>
          <!-- Allows the user to remove the search filter -->
          <v-btn
            color="red lighten-2"
            v-if="remove_filter"
            @click="removeSearch()"
            >Remove filter</v-btn
          >
        </v-col>
      </v-row>
    </div>
    <!-- Displays the book list in a flex container-->
    <div class="flex-container">
      <BookCard
        v-for="(book, index) in book_list_nonzero_quantity"
        v-bind:key="index"
        v-bind:book-information="book"
      />
    </div>
    <v-snackbar v-model="snackbar">
      {{ this.notificationText }}
      <v-btn color="pink" text @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-content>
</template>

<script>
import BookCard from "./BookCard";

export default {
  name: "BookList",
  components: {
    // Donate
    BookCard,
  },
  data: function() {
    return {
      notificationText: "",
      snackbar: false,
      // This array stores all book retrieved from the database
      book_list: [],
      // This array stores a filtered book list without a quantity of zero
      book_list_nonzero_quantity: [],
      query: "",
      remove_filter: false,
    };
  },
  props: {},
  methods: {
    // Brings up a snackbar notification with the provided text
    notify: function(text) {
      this.snackbar = true;
      this.notificationText = text;
    },
    // Searches through the books 
    search() {
      this.remove_filter = true;
      this.book_list_nonzero_quantity = this.book_list.filter((book) => {
        return (
          book.Quantity !== 0 &&
          book.Title.toLocaleLowerCase().includes(
            this.query.toLocaleLowerCase()
          )
        );
      });
    },
    // Removes the filter
    removeSearch() {
      this.query = "";
      this.search();
      this.remove_filter = false;
    },
    // Refreshs the list of books by querying the backend
    refreshList() {
      const component = this;
      fetch("http://localhost:3000/api/books")
        .then(function(response) {
          if (response.status === 200) {
            response.json().then(function(data) {
              component.book_list = data;
              component.book_list_nonzero_quantity = component.book_list.filter(
                (element) => {
                  return element.Quantity !== 0;
                }
              );
              component.notificationText = "Successfully loaded book list.";
              component.snackbar = true;
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
  },
  // Gets the list of books when this component is created
  created: function() {
    this.refreshList();
  },
};
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}
</style>
