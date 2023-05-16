<script lang="ts">
  import Icon from "@iconify/svelte";
  import { auth } from "$lib/auth";
  import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
  import { FirebaseError } from "firebase/app";
  import { goto } from "$app/navigation";

  let creatingAcc = false;
  let email = "";
  let password = "";
  let error = "";
  let passwordError = "";

  async function signup() {
    validatePassword();
    if (passwordError) return;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
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

  async function signin() {
    validatePassword();
    if (passwordError) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      goto("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === "") {
          error = ""; // TODO
        }
      } else {
        error = "Oops! Something went wrong.";
      }
    }
  }

  function validatePassword() {
    if (password.length < 6) {
      passwordError = "Password needs to be at least 6 characters";
    } else {
      passwordError = "";
    }
  }

  async function test() {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    let resp = await fetch("/api/tasks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(resp);
  }
</script>

<section class="flex flex-col w-96 mx-auto my-16 gap-4">
  <button class="btn variant-filled-primary" on:click={test}> TEST </button>
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
    <button class="btn variant-filled-primary" on:click={creatingAcc ? signup : signin}>
      {#if creatingAcc}
        Create account
      {:else}
        Sign in
      {/if}
    </button>
  </form>

  <button class="text-secondary-800-100-token" on:click={() => (creatingAcc = !creatingAcc)}>
    {#if creatingAcc}
      Already have an account? Sign in
    {:else}
      Create account
    {/if}
  </button>
</section>

<button
  class="btn variant-filled-primary"
  on:click={() => {
    email = "tomasz13nocon@gmail.com";
    password = "qweasd";
    signin();
  }}
>
  CLICK
</button>
