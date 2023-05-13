<script lang="ts">
  import Icon from "@iconify/svelte";
  import { auth } from "$lib/auth";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { FirebaseError } from "firebase/app";
  import { goto } from "$app/navigation";

  let creatingAcc = false;
  let error = "";

  async function signin() {
    try {
      await signInWithEmailAndPassword(auth, "tomasz13nocon@gmail.com", "qweasd");
      goto("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === "auth/email-already-in-use") {
          error = "Email already in use";
        } else if (e.code === "auth/weak-password") {
          error = "Password too weak";
        }
      } else {
        error = "Oops! Something went wrong.";
      }
    }
  }
</script>

<section class="flex flex-col w-96 mx-auto my-16 gap-4">
  <h1>
    {#if creatingAcc}
      Create account
    {:else}
      Sign in
    {/if}
  </h1>

  <form class="flex flex-col my-8 gap-4">
    {#if error}
      <div class="alert variant-filled-error">
        <Icon icon="eva:alert-circle-fill" width="24" />
        <div class="alert-message">
          {error}
        </div>
      </div>
    {/if}
    <label>
      <span class="label">Email</span>
      <input required type="email" name="email" class="input" />
    </label>
    <label>
      <span class="label">Password</span>
      <input required type="password" name="password" class="input" />
    </label>
    <button type="submit" class="btn variant-filled-primary">
      {#if creatingAcc}
        Create account
      {:else}
        Sign in
      {/if}
    </button>
  </form>

  <button class="btn variant-filled-primary" on:click={signin}> CLICK </button>
  <button class="text-secondary-800-100-token" on:click={() => (creatingAcc = !creatingAcc)}>
    {#if creatingAcc}
      Already have an account? Sign in
    {:else}
      Create account
    {/if}
  </button>
</section>
