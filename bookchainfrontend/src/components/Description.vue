<template>
  <v-card class="elevation-12">
    <v-toolbar color="primary" dark flat>
      <v-spacer />
      <!-- Displays the title of the book -->
      <v-toolbar-title style="font-size: 2em;"
        >{{ bookInformation.Title }}
      </v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-card-text class="flex-container">
      <div class="flex-div-left">
        <!-- Displays the cover art -->
        <div class="sticky-claim">
          <v-img
            class="sticky-claim-img"
            :src="bookInformation.Cover_url"
            alt="Book Cover"
            max-width="80%"
            max-height="500px"
            contain
          />
          <!-- Shows the claim button so the user can claim the book -->
          <v-dialog v-model="claim_dialog" max-width="1000px">
            <template v-slot:activator="{ on }">
              <v-btn
                color="red lighten-2"
                class="sticky-claim-button"
                dark
                v-on="on"
              >
                Claim Book
              </v-btn>
            </template>
            <ClaimDialog
              v-bind:book-information="bookInformation"
              @close-dialog="closeDialogs()"
              @success="notifySuccess()"
            />
            <!-- v-bind:book-information="bookInformation" -->
          </v-dialog>
          <!-- Shows the report dialog so the user can report the book as missing -->
          <v-dialog v-model="report_dialog" max-width="1000px">
            <template v-slot:activator="{ on }">
              <v-btn
                color="red lighten-2"
                class="sticky-claim-button"
                dark
                v-on="on"
              >
                Report Book as Missing
              </v-btn>
            </template>
            <ReportDialog
              v-bind:book-information="bookInformation"
              @close-dialog="closeDialogs()"
            />
            <!-- v-bind:book-information="bookInformation" -->
          </v-dialog>
        </div>
      </div>
      <div class="flex-div-right">
        <!-- Shows the books information, including the title, authors, 
            number of pages, quantity available, ISBN, a url with more information
            and a small description of the book 
            -->
        <div class="book-information">
          <span v-if="bookInformation.Title"><h3>Title:</h3></span>
          <span v-if="bookInformation.Title"
            ><p>{{ bookInformation.Title }}</p></span
          >
          <span v-if="bookInformation.Authors"><h3>Author(s):</h3></span>
          <span v-if="bookInformation.Authors"
            ><p>{{ bookInformation.Authors }}</p></span
          >
          <span v-if="bookInformation.Num_pages"
            ><h3>Number of pages:</h3></span
          >
          <span v-if="bookInformation.Num_pages"
            ><p>{{ bookInformation.Num_pages }}</p></span
          >
          <span v-if="bookInformation.Quantity"><h3>In-Stock:</h3></span>
          <span v-if="bookInformation.Quantity"
            ><p>{{ bookInformation.Quantity }}</p></span
          >
          <span v-if="bookInformation.ISBN"><h3>ISBN:</h3></span>
          <span v-if="bookInformation.ISBN"
            ><p>{{ bookInformation.ISBN }}</p></span
          >
          <span v-if="bookInformation.Info_url"
            ><h3>More Information:</h3></span
          >
          <span v-if="bookInformation.Info_url"
            ><p>
              <a :href="bookInformation.Info_url" rel="noopener noreferrer"
                >More Information</a
              >
            </p></span
          >
          <span v-if="bookInformation.Description"><h3>Description:</h3></span>
          <span v-if="bookInformation.Description">
            <p>{{ bookInformation.Description }}</p>
          </span>
        </div>
        <!-- <div class='left-book-information'>
                </div> -->
      </div>
      <!-- Shows the reviews and alows the user to create their own review -->
      <div class="reviews">
        <h1>Reviews</h1>
        <hr />
        <ReviewForm
          class="ma-5"
          :isbn="bookInformation.ISBN"
          :title="bookInformation.Title"
          v-on:newReview="addReview($event)"
        ></ReviewForm>
        <hr />
        <h1 class="pt-5">Reader Reviews</h1>
        <h3>Average Rating: {{ this.averageRating.toFixed(2) }}</h3>
        <div class="d-block" v-for="(review, index) in reviews" :key="index">
          <div class="d-inline-flex">
            <p class="title pt-5 pl-5">
              {{ review.Name }}
            </p>
            <v-rating
              readonly
              class="pt-5 pl-5"
              :value="review.Rating"
            ></v-rating>
          </div>
          <p class="pl-5">{{ review["Text"] }}</p>
          <hr />
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey" v-on:click="$emit('close-dialog')">Close</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
import ClaimDialog from "./ClaimDialog";
import ReportDialog from "./ReportDialog";
import ReviewForm from "./Reviews/ReviewForm";

export default {
  name: "Description",
  components: {
    // Donate
    ClaimDialog,
    ReportDialog,
    ReviewForm,
  },
  data: function() {
    return {
      // variables for showing the various dialogs
      claim_dialog: false,
      report_dialog: false,
      // an array to store the reviews
      reviews: [],
      // The average rating of the book
      averageRating: 0,
    };
  },
  props: {
    // A required property that includes book information such as title and authors
    bookInformation: {
      required: true,
    },
  },
  methods: {
    // This closes the claim and report dialog if they are open
    closeDialogs: function() {
      this.claim_dialog = false;
      this.report_dialog = false;
    },
    // This adds a review to the database
    async addReview(review_data) {
      this.reviews.push(review_data);
      const avgResp = await fetch(
        "http://localhost:3000/api/reviews/ratings/" + this.bookInformation.ISBN
      );
      const rating = await avgResp.json();
      this.averageRating = JSON.parse(rating)["avgRating"];
    },
  },
  async created() {
    // This fetches the reviews
    this.bookInformation.Description = this.bookInformation.Description
      ? JSON.parse(this.bookInformation.Description)[0].text
      : "N/A";
    const resp = await fetch(
      "http://localhost:3000/api/reviews/isbn/" + this.bookInformation.ISBN
    );
    this.reviews = await resp.json();
    const avgResp = await fetch(
      "http://localhost:3000/api/reviews/ratings/" + this.bookInformation.ISBN
    );
    const rating = await avgResp.json();
    console.log(rating);
    if (!rating.includes("NaN")) {
      this.averageRating = JSON.parse(rating)["avgRating"];
    }
  },
};
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

.flex-div-left {
  flex-basis: 40%;
  flex-grow: 1;
  align-items: center;
  margin-top: 50px;
}

.sticky-claim {
  position: sticky;
  top: 25vh;
  position: -webkit-sticky;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.sticky-claim-img {
  margin-left: auto;
  margin-right: auto;
}

.sticky-claim-button {
  margin: 10px 10px 10px 10px;
}

.flex-div-right {
  display: flex;
  flex-basis: 60%;
  flex-grow: 1;
  margin-top: 50px;
  background-color: #f4f4f4;
}

.reviews {
  flex-basis: 100%;
  margin-top: 50px;
}

.book-information {
  display: flex;
  flex-wrap: wrap;
}

.book-information > span {
  flex-basis: 50%;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
}

.reviews > h1 {
  padding-bottom: 10px;
}
</style>
