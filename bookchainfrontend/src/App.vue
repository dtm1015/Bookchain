<template>
  <v-app>
    <SideNav></SideNav>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>

import SideNav from "./components/nav/SideNav";

export default {

  name: "App",

  components: {
    SideNav
  },

  data: function() {
    return {

    };
  },
};
</script>

