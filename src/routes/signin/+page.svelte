<script lang="ts">
  import Icon from "@iconify/svelte";
  import { auth } from "$lib/auth";
  import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
  } from "firebase/auth";
  import { FirebaseError } from "firebase/app";
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores";

  let creatingAcc = false;
  let email = "";
  let password = "";
  let error = "";
  let passwordError = "";

  const googleProvider = new GoogleAuthProvider();

  async function signup() {
    validatePassword();
    if (passwordError) return;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
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

  async function signin() {
    validatePassword();
    if (passwordError) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === "") {
          error = "Oops! Something went wrong."; // TODO
        }
      } else {
        error = "Oops! Something went wrong.";
      }
    }
  }

  async function signinGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      error = "Oops! Something went wrong.";
    }
  }

  function validatePassword() {
    if (password.length < 6) {
      passwordError = "Password needs to be at least 6 characters";
    } else {
      passwordError = "";
    }
  }

  $: if ($user) {
    goto("/");
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

  <button class="btn variant-filled-primary mt-4" on:click={signinGoogle}>
    Sign in with Google <Icon icon="eva:google-fill" width="30" class="ml-4" />
  </button>

  <div class="text-center">or use email and password:</div>

  <form class="flex flex-col my-4 gap-4">
    {#if error}
      <div class="alert variant-filled-error">
        <Icon icon="eva:alert-circle-fill" width="24" />
        <div class="alert-message">
          {error}
        </div>
      </div>
    {/if}
    <label class="label">
      <span>Email</span>
      <input required type="email" name="email" class="input" bind:value={email} />
    </label>
    <label class="label">
      <span>Password</span>
      <input
        required
        type="password"
        name="password"
        class="input {passwordError ? 'input-error' : ''}"
        on:blur={validatePassword}
        on:focus={() => (passwordError = "")}
        bind:value={password}
      />
      {#if passwordError}
        <div class="text-error-700-200-token">{passwordError}</div>
      {/if}
    </label>
    <button class="btn variant-ghost-primary" on:click={creatingAcc ? signup : signin}>
      {#if creatingAcc}
        Create account
      {:else}
        Sign in
      {/if}
    </button>
  </form>

  <button
    class="text-secondary-800-100-token hover:underline"
    on:click={() => (creatingAcc = !creatingAcc)}
  >
    {#if creatingAcc}
      Already have an account? Sign in
    {:else}
      Don't have an account?
    {/if}
  </button>
</section>
