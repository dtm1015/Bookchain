<template>
    <!-- Displays the title, authors, average review, publish date, and the cover art-->
    <div class="div-container" v-if="this.bookInformation.Quantity !== 0">
        <!-- Allows the user to click it to get the book information -->
        <v-dialog v-model="book_description_dialog" max-width="1000px">
            <template v-slot:activator="{ on }">
                <v-card class="elevation-12" v-on="on" width="400px" height="400px">
                    <v-toolbar color="primary" dark flat>
                        <v-spacer></v-spacer>
                        <v-toolbar-title style="font-size: 1em;">{{
                            bookInformation.Title
                            }}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card-text class="text-center">
                        <div height="150px">
                            <v-img v-if="bookInformation.Cover_url"
                                   class="sticky-claim-img"
                                   :src="bookInformation.Cover_url"
                                   alt="Book Cover"
                                   contain
                                   max-height="150px"
                            />
                            <v-icon v-else class="sticky-claim-img" size="6em">mdi-book-open-variant</v-icon>
                        </div>
                        <div class="book-information">
                            <span v-if="bookInformation.Authors"><h3>Author(s):</h3></span>
                            <span v-if="bookInformation.Authors"
                            ><p>{{ authors }}</p></span
                            >
                            <span v-if="bookInformation.Publish_date"
                            ><h3>Published:</h3></span
                            >
                            <span v-if="bookInformation.Publish_date"
                            ><p>{{ bookInformation.Publish_date }}</p></span
                            >
                        </div>
                        <v-rating v-model="rating" readonly half-increments/>
                    </v-card-text>
                </v-card>
            </template>
            <Description
                    v-bind:book-information="bookInformation"
                    @close-dialog="closeDialogs()"
            />
        </v-dialog>
    </div>
</template>

<script>
    import Description from "./Description";

    export default {
        name: "BookCard",
        components: {
            // Donate
            Description,
        },
        data: function () {
            return {
                book_description_dialog: false,
                authors: "",
                rating: 0,
            };
        },
        props: {
            // Requires the book information be passed so it can 
            // display it in the description
            bookInformation: {
                type: Object,
                required: true,
            },
        },
        methods: {
            closeDialogs: function () {
                this.book_description_dialog = false;
            },
        },
        // Filters out the authors from an array
        // and fetches the average rating
        created() {
            const authors_array = JSON.parse(this.bookInformation.Authors);
            for (let i = 0; i < authors_array.length; i++) {
                this.authors = this.authors.concat(authors_array[i].name);
                if (i < authors_array.length - 1) {
                    this.authors = this.authors.concat(", ");
                }
            }
            this.bookInformation.Authors = this.authors;

            const component = this;
            fetch(
                "http://localhost:3000/api/reviews/ratings/".concat(
                    component.bookInformation.ISBN
                )
            )
                .then(function (response) {
                    response.json().then(function (data) {
                        if (!data.includes("NaN")) {
                            component.rating = JSON.parse(data).avgRating;
                        }
                    });
                })
                .catch((error) => {
                    console.log(error);
                    component.notificationText =
                        "An error occurred. Please reload the page.";
                    component.snackbar = true;
                });
        },
    };
</script>

<style scoped>
    .div-container {
        width: 400px;
        margin-left: 20px;
        margin-bottom: 20px;
    }

    .sticky-claim-img {
        margin-left: auto;
        margin-right: auto;
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

    .book-information > span > p {
        width: 160px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    v-rating {
        margin-left: auto;
        margin-right: auto;
    }
</style>
