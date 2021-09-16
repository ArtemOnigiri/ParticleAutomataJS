<script lang="ts">
  export let colors: string[] = [];
  export let selectedId: number = 0;
</script>

<div class="wrapper">
  {#each Array(...colors.entries()) as idAndColor}
    <button
      class:selected={selectedId === idAndColor[0]}
      name="color"
      type="radio"
      style={`background-color: ${idAndColor[1]};`}
      on:click={() => (selectedId = idAndColor[0])}
    />
  {/each}
</div>

<style>
  .selected:before {
    content: "";
    display: block;
    width: 6px;
    height: 14px;
    border-bottom: 3px solid white;
    border-right: 3px solid white;
    transform: translateY(-2px) rotate(45deg);
  }
  .wrapper {
    display: flex;
    /* flex-wrap: wrap; */
    overflow: hidden;
    border-radius: 5px;
    /* border: 2px dotted rgba(0, 0, 0, 0.5); */
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 29px;
    padding: 0;
    margin: 0;
    border-radius: 0;
  }
  /* label {
    font-size: 75%;
    text-align: center;
    width: 30px;
    line-height: 30px;
    overflow: hidden;
    cursor: pointer;
    width: 100%;
  }
  label:hover {
    box-shadow: inset 0 0 0 100px rgba(0, 0, 0, 0.1);
  }
  input {
    appearance: none;
    width: 100%;
    height: 100%;
    margin: 0;
  }
  input:checked::before {
    content: "";
    display: block;
    width: 5px;
    height: 10px;
    border-bottom: 3px solid white;
    border-right: 3px solid white;
    transform: rotate(45deg) translateY(-1px);
    margin-right: 7px;
  } */
</style>
