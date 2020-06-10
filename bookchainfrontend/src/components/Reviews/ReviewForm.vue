<template>
    <div>
        <h2 class="pt-5">Post a new review!</h2>
        <v-rating hover v-model="rating"></v-rating>
        <v-textarea outlined placeholder="Optional" label="Name" v-model="name" height="1em"></v-textarea>
        <v-textarea outlined v-model="review" label="Tell us what you think!"></v-textarea>
        <v-btn @click="submitReview()">Post Review</v-btn>
        <v-snackbar v-model="this.snackbar">{{this.notif}}</v-snackbar>
    </div>
</template>

<script>
    export default {
        //form to leave a review
        name: "ReviewForm",

        //title, isbn
        props: ['title', 'isbn'],

        data() {
            //field variables
            return {
                rating: 0,
                review: '',
                snackbar: false,
                notif: '',
                name: 'anonymous'
            }
        },

        methods: {
            //submit review
            //verifys review is valid and posts it to server then sends data to parent component
            async submitReview() {
                console.log(this.rating + this.review)
                if (this.rating === 0 && this.review === '') {
                    this.showMessage('Rating and review must be populated to submit');
                    return;
                }

                this.name = this.name === '' ? 'anonymous' : this.name;

                const toSend = {
                    isbn: this.isbn,
                    text: this.review,
                    rating: this.rating,
                    title: this.title,
                    name: this.name,
                };

                const resp = await fetch('http://localhost:3000/api/reviews', {
                    method: 'POST',
                    body: JSON.stringify(toSend),
                    headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });

                if (resp.status !== 200) {
                    this.showMessage('There was a problem posting your review.');
                    return;
                }

                const review_data = await resp.json();
                this.showMessage('Review posted!');
                this.$emit('newReview', review_data);

                this.review = '';
                this.name = 'anonymous';
                this.rating = 0;
            },

            showMessage(message) {
                this.notif = message;
                this.snackbar = true;
                setTimeout(() => {this.snackbar = false}, 2000)
            }


        }

    }
</script>

<style scoped>

</style>