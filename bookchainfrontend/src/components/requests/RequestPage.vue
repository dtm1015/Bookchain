<template>
  <div class="container">
    <div class="d-inline-flex">
      <h1>Current Requests</h1>
      <div class="dialog-container">
        <RequestDialog v-on:newRequest="requests.push($event)"></RequestDialog>
      </div>
    </div>

    <div class="card-container">
      <RequestCard
        class="pa-5"
        v-for="(request, index) in this.requests"
        :key="index"
        :request="request"
      ></RequestCard>
    </div>
  </div>
</template>

<script>
import RequestCard from "./RequestCard";
import RequestDialog from "./RequestDialog";

export default {
  //page with a button to make request and a the request list
  name: "RequestPage",
  components: {
    RequestDialog,
    RequestCard,
  },
  data() {
    //request array
    return {
      requests: [],
    };
  },
  methods: {
    //get all requests
    fetchRequests() {
      fetch("http://localhost:3000/api/requests").then((response) => {
        response.json().then((data) => {
          this.requests = data;
        });
      });
    },
  },
  created() {
    this.fetchRequests();
  },
};
</script>

<style scoped>
.dialog-container {
  position: absolute;
  top: 30px;
  right: 5px;
}

.card-container {
  padding: 1em;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: stretch;
}
</style>
