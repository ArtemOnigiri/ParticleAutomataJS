<script lang="ts">
  export let name: string;
  export let min: number = 0;
  export let max: number = 100;
  export let value: number = min;
  export let step: number = 1;
</script>

<label class="wrapper">
  <div>{name}: {value}</div>
  <input type="range" bind:value {min} {max} {step} />
</label>

<style>
  .wrapper {
    /* display: flex; */
    display: block;
    font-weight: bold;
  }
  .wrapper:not(:last-child) {
    margin-bottom: 10px;
  }
  input {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    /* margin-left: 10px; */
    /* transform: translateY(-4px); */
  }
  div {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: uppercase;
    overflow: hidden;
    font-size: 75%;
  }
  input {
    margin-top: 2px;
  }
</style>
