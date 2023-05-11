<script lang="ts">
  function submit() {
    console.log("submit");
  }
</script>

<div class="card p-4 m-4">
  <label class="label">
    <span>Symbol (name)</span>
    <input class="input p-4" type="text" placeholder="Z3R0" />
  </label>

  <label class="label pt-4">
    <span>Faction</span>
    <input disabled class="input p-4" type="text" placeholder="COSMIC" />
  </label>

  <button type="button" class="btn variant-filled" on:click={submit}>Submit</button>
</div>
