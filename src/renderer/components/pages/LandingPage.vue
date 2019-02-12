<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <main>
      <h1>hello world!</h1>
      <p>{{db}}</p>
    </main>
    <router-link to="/editor">编辑器</router-link>
    <router-link to="/passwordLogin">登录</router-link>
  </div>
</template>

<script>

  export default {
    name: 'landing-page',
    data () {
      return {
        db: '',
        name: this.$route.name,
        path: this.$route.path,
      }
    },
     methods: {
      getdb: function(){
        var slef = this;
        // slef.$db.all("select * from test", function(err, res) { 
        //   if (!err) {
        //       slef.db = JSON.stringify(res)
        //   } else {
        //       console.log(err);
        //   }
        // });
      }
    },
    created() {
      this.getdb()
    },
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  /* main > div { flex-basis: 50%; } */

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>
