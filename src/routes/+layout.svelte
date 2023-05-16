<script lang="ts">
  import "@skeletonlabs/skeleton/themes/theme-crimson.css";
  import "@skeletonlabs/skeleton/styles/all.css";
  import "../app.postcss";
  import { AppShell, AppBar, LightSwitch } from "@skeletonlabs/skeleton";
  import { onAuthStateChanged, signOut as _signOut } from "firebase/auth";
  import { onMount } from "svelte";
  import { auth } from "$lib/auth";
  import { user } from "$lib/stores";
  import { identicon } from "minidenticons";

  onMount(() => {
    onAuthStateChanged(auth, (userData) => {
      $user = userData;
    });
  });

  async function signOut() {
    await _signOut(auth);
    $user = null;
  }

  let showDropdown = false;
</script>

<AppShell slotPageContent="h-full w-full">
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <a href="/" class="text-lg uppercase tracking-wider">track<strong>every</strong>.thing</a>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <LightSwitch />
        {#if $user}
          <button
            on:click={() => (showDropdown = !showDropdown)}
            class="w-12 -my-1 !ml-8 block variant-ghost-tertiary rounded-full cursor-pointer"
          >
            <img src="data:image/svg+xml;utf8,{identicon($user.uid)}" alt="generated avatar" />
          </button>
          {#if showDropdown}
            <ul
              class="list absolute top-16 right-0 w-48 bg-surface-100-800-token rounded-lg shadow-lg"
            >
              <a href="/profile" class="block p-4">Profile TODO</a>
              <button on:click={signOut} class="block p-4">Sign out</button>
            </ul>
          {/if}
        {:else}
          <a href="/signin" class="btn variant-filled-primary">Sign in</a>
        {/if}
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <slot />
</AppShell>
