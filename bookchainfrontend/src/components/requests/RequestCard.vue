<template>
    <div class="d-flex">
        <v-card outlined width="300px">
            <v-card-title color="primary" class="title justify-center">
                {{ this.title }}
            </v-card-title>
            <div class="d-flex justify-center text-center pa-5">
                <v-img v-if="this.cover_link"
                       class="justify-center text-center"
                       :src="this.cover_link"
                       max-height="200"
                       max-width="100"
                >
                </v-img>
                <v-icon v-else size="4em">mdi-book-open-variant</v-icon>
            </div>
            <v-card-text class="text-center justify-center">
                Author(s): {{ this.authors }}
                <br/>
                <v-dialog v-model="donate_book_dialog" max-width="1000px">
                    <template v-slot:activator="{ on }">
                        <v-btn
                                color="red lighten-2"
                                class="sticky-claim-button"
                                dark
                                v-on="on"
                        >
                            Donate Book
                        </v-btn>
                    </template>

                    <Donate
                            v-bind:token-amount="tokens"
                            v-bind:isbn_prop="this.request['Book_ID']"
                            v-on:close-dialog="closeDialogs()"
                    />
                </v-dialog>
            </v-card-text>
            <v-card-actions class="justify-center">
                <p>
                    {{ tokens }} Tokens
                </p>
                <p>
                    <v-btn color="red lighten-2" dark @click="support_request_dialog = true">
                        <v-icon class="plus-icon" size="2em">
                            mdi-plus-thick
                        </v-icon>
                    </v-btn>
                    <v-dialog v-model="support_request_dialog" max-width="1000px">
                        <DonateRequest v-on:donate="donationMessage($event)" :isbn="this.request['Book_ID']"></DonateRequest>
                    </v-dialog>
                </p>
            </v-card-actions>

            <v-snackbar :timeout="5000" v-model="snackbar">
                {{ this.notificationText }}
            </v-snackbar>
        </v-card>
    </div>
</template>

<script>
    import Donate from "../Donate";
    import DonateRequest from "./DonateRequest";

    export default {
        //front end representation of request for display

        name: "RequestCard",
        components: {
            Donate,
            DonateRequest
        },
        //json with request data
        props: ['request'],

        //request fields
        data: () => ({
            tokens: 0,
            authors: '',
            title: '',
            cover_link: '',
            notificationText: "",
            snackbar: false,
            donate_book_dialog: false,
            support_request_dialog: false,
        }),

        methods: {
            logSuc: function (text) {
                console.log(text);
            },
            notify: function (text) {
                this.snackbar = true;
                this.notificationText = text;
            },
            closeDialogs: function () {
                this.donate_book_dialog = false;
                this.book_description_dialog = false;
                this.donate_book_dialog_multiple = false;
            },
            donationMessage: function(donation) {
                this.notify("Donation successful !");
                this.tokens += donation;
                this.support_request_dialog = false;
            }
        },
        //fetch book data from open library and set request fields
        created() {
            fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${this.request['Book_ID']}&format=json&jscmd=data`, {method: 'GET'}).then(resp => {
                resp.json().then(data => {
                    const book = data[`ISBN:${this.request['Book_ID']}`];
                    this.tokens = this.request['Investment'];
                    this.title = book['title'];
                    this.cover_link = book['cover'] ? book['cover']['medium'] : '';
                    const author_list = book['authors'];
                    author_list.forEach(auth => {
                        this.authors += ', ' + auth.name;
                    });
                    this.authors = this.authors.slice(1)
                })
            })
        }
    };
</script>
<style scoped>
    p {
        padding: 5px;
        font-size: 2em;
    }

    .title {
        background-color: #b3d4fc;
    }

    .plus-icon:hover {
        color: goldenrod;
    }
</style>
