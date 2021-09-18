<script>
  export let title;
  export let checked = false;
</script>

<label>
  <input type="checkbox" bind:checked />
  <span>{title}</span>
</label>

<style>
  label {
    display: inline-block;
    cursor: pointer;
  }
  input {
    position: relative;
    appearance: none;
    margin: 0;
    padding: 0;
  }
  input::before {
    content: "";
    position: absolute;
    display: block;
    width: 15px;
    height: 15px;
    transform: translate(0, -14px);
    border-radius: 3px;
    background-color: rgba(255, 255, 255, 0.3);
  }
  input::after {
    content: "";
    position: absolute;
    display: block;
    width: 5px;
    height: 10px;
    border-bottom: 3px solid;
    border-right: 3px solid;
    border-color: rgb(255, 255, 255);
    opacity: 0;
    transform: translate(4px, -16px) rotate(45deg);
    /* background-color: red; */
    transition-duration: 0.2s;
  }
  input:checked::after {
    opacity: 1;
    transform: translate(4px, -14px) rotate(45deg);
  }
  span {
    margin-left: 20px;
  }
</style>
