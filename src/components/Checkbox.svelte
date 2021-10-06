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
    display: block;
    cursor: pointer;
    margin-bottom: 5px;
  }
  input {
    user-select: none;
    position: relative;
    appearance: none;
    -webkit-appearance: none;
    margin: 0px 5px 0px 0px;
    outline: none;
    border: none;
  }

  input::before {
    content: "";
    box-sizing: border-box;
    transform: translate(0px, 2px);
    display: block;
    width: 15px;
    height: 15px;
    border-radius: 2px;
    background-color: rgba(255, 255, 255, 0.3);
    transition-duration: 0.2s;
  }

  input:after {
    content: "";
    position: absolute;
    display: block;
    left: 1px;
    top: 3px;
    width: 10px;
    height: 5px;
    transform: translateY(-2px) rotateZ(-45deg);
    border-bottom: 4px solid whitesmoke;
    border-left: 4px solid whitesmoke;
    opacity: 0;
    transition-duration: 0.2s;
  }
  input:checked::after {
    transform: rotateZ(-45deg);
    opacity: 1;
  }
</style>
