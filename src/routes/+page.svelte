<script>
    import { onMount } from 'svelte';
    import { afterUpdate } from 'svelte';

    let tags = [];
    let cntTag = '';
    let cntItems = [];
    let showAddTagModal = false;
    let showAddItemModal = false;
    let addTagModalValue = '';
    let formData = new FormData();
    let addTagModalInput;
    let itemThumbnail = "";
    let itemThumbnailValid = false;

    onMount(async () => {
        const res = await fetch('/api/tags');
        tags = await res.json();
        cntTag = tags[0];
        cntItems = await getItems(cntTag);
    });

    afterUpdate(() => {
        if (showAddTagModal) {
            addTagModalInput.focus();
        }

        if (itemThumbnail !== "") {
            const img = new Image()
            img.src = itemThumbnail

            img.onload = () => {
                itemThumbnailValid = true 
            }

            img.onerror = () => {
                itemThumbnailValid = false
            }
        } else {
            itemThumbnailValid = false
        }
    });

    const getItems = async (tagName) => {
        const res = await fetch(`api/items/${tagName}`);
        return await res.json();
    };

    const changeTag = (tagName) => {
        document.querySelector('.selectedTag').classList.remove('selectedTag');
        event.currentTarget.classList.add('selectedTag');

        cntTag = tagName;
        getItems(cntTag).then((res) => (cntItems = res));
    };

    const addTag = (tagName) => {
        tags = [...tags, tagName]; // not able to use push becuase svlete can't detech file changed

        // POST 요청
        fetch('/api/addTag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tagName: tagName
            })
        });

        showAddTagModal = false;
    };

    const addItem = (event) => {
        event.preventDefault();

        formData = new FormData(event.target);
        let newItem = {
            title: formData.get('title'),
            url: formData.get('url'),
            description: formData.get('desc'),
            image: formData.get('img')
        };
        cntItems = [...cntItems, newItem];

        // POST 요청
        fetch(`/api/addItem/${cntTag}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });

        showAddItemModal = false;
    };
</script>

<main>
    <nav>
        <figure><p>GPT Organizer</p></figure>

        {#each tags as tag, index}
            {#if index == 0}
                <button class="tags selectedTag" on:click={() => changeTag(tag)}
                    ><p>{tag}</p></button
                >
            {:else}
                <button class="tags" on:click={() => changeTag(tag)}
                    ><p>{tag}</p></button
                >
            {/if}
        {/each}

        <button
            id="addTag"
            on:click={() => (showAddTagModal = showAddTagModal ? false : true)}
            >Add Tag</button
        >
    </nav>

    <section style="--blur:{showAddItemModal || showAddTagModal ? 3 : 0}; --clickable:{showAddItemModal || showAddTagModal ? 'none' : 'auto'};">
        <header>
            <p>{cntTag}</p>
        </header>

        <article>
            <div id="itemBar">
                <img src="/viewOption.png" alt="">

                <button
                    id="addItem"
                    on:click={() =>
                        (showAddItemModal = showAddItemModal ? false : true)}
                    >New</button
                >
            </div>

            <div id="itemBox">
                {#each cntItems as cntItem}
                    <a href={cntItem.url} class="itemA" target="_blank">
                        <div class="item">
                            <img
                                src={cntItem.image}
                                alt={cntItem.description}
                                height="160px"
                            />
                            <div><p>{cntItem.title}</p></div>
                        </div>
                    </a>
                {/each}
            </div>
        </article>
    </section>

    {#if showAddTagModal}
        <div id="addTagModal">
            <input
                type="text"
                placeholder="tag name"
                bind:this={addTagModalInput}
                bind:value={addTagModalValue}
            />
            <button on:click={() => addTag(addTagModalValue)}>☑</button>
        </div>
    {/if}

    {#if showAddItemModal}
        <div id="addItemModal">
            <div id="titleBox">
                <img src={itemThumbnail} alt="" style="--itemThumbnailValid: {itemThumbnailValid ? 'auto' : 'none'};">
                <p>{cntTag}</p>
            </div>
            <form on:submit={addItem}>
                <label for="conversationName">Title</label>
                <input
                    type="text"
                    placeholder="conversation name"
                    id="conversationName"
                    name="title"
                />

                <label for="conversationURL">URL</label>
                <input
                    type="url"
                    placeholder="conversation URL"
                    id="conversationURL"
                    name="url"
                />

                <label for="conversationDesc">Description</label>
                <input
                    type="text"
                    placeholder="conversation Description"
                    id="conversationDesc"
                    name="desc"
                />

                <label for="conversationImg">Thumbnail</label>
                <input
                    type="text"
                    placeholder="conversation Image"
                    id="conversationImg"
                    name="img"
                    bind:value={itemThumbnail}
                />
                <div id="confirmBtnBox">
                    <input type="submit" value="Create" />
                    <button on:click={() => {
                        showAddItemModal = false
                        itemThumbnail = ''
                    }}>Cancel</button>
                </div>
            </form>
        </div>
    {/if}
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;

        display: flex;
        flex-direction: row;

        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
            'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
            'Helvetica Neue', sans-serif;
    }

    p {
        margin: 0;
    }

    nav {
        width: 250px;
        height: 100vh;
        background-color: #ecca9c;

        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
    }

    section {
        width: calc(100vw - 200px);
        height: 100vh;
        background-color: #e8efcf;
        filter: blur(calc(var(--blur) * 1px));
        transition: filter 0.3s ease-in-out;
        pointer-events: var(--clickable);
    }

    header {
        width: 100%;
        height: 200px;
        /* border: 1px solid black;
        box-sizing: border-box; */

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    header > p {
        font-size: 50px;
        font-weight: 700;

        margin-left: 50px;
    }

    figure {
        margin: 0;
        width: 100%;
        height: 200px;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    figure > p {
        font-size: 25px;
        font-weight: 700;
        margin-top: 20px;
    }

    article {
        width: 100%;
        height: calc(100% - 200px);
        /* border: 1px solid black;
        box-sizing: border-box; */

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #itemBar {
        width: calc(100% - 100px);
        height: 30px;
        border-bottom: 1px solid black;

        display: flex;
        flex-direction: row;
        align-items: center;
    }

    #itemBox {
        width: calc(100% - 100px);
        height: calc(100% - 30px);

        display: flex;
        flex-flow: row wrap;
        justify-content: start;
        align-items: flex-start;
        align-content: flex-start;
        gap: 25px; /* 간격을 조절 */

        padding-top: 25px;

        overflow-y: auto;
    }

    .itemA {
        text-decoration: none;
        /* margin: 25px; */
    }

    .item {
        width: 300px;
        height: 200px;
        border-radius: 10px;
        overflow: hidden;

        background-color: #dba979;

        display: flex;
        flex-direction: column;
    }

    .item > img {
        object-fit: cover;
    }

    .item > div {
        width: 100%;
        height: 40px;

        border-top: 1px solid black;
        box-sizing: border-box;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: start;
    }

    .item > div > p {
        font-size: 18px;
        color: black;
        margin-left: 10px;
    }

    .tags {
        width: 230px;
        height: 40px;
        border-radius: 10px;
        background-color: none;

        margin-top: 5px;
        margin-bottom: 5px;

        display: flex;
        flex-direction: row;
        align-items: center;

        border: none;
        background: none;
        cursor: pointer;
    }

    .tags:hover {
        /* border: 1px solid black; */
        background-color: #dba979;
    }

    .selectedTag {
        background-color: #dba979;
    }

    .tags > p {
        margin: 0;
        margin-left: 25px;
        font-size: 18px;
    }

    #addTag {
        width: 230px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid black;
        background: none;
        cursor: pointer;

        margin-top: auto;
        margin-bottom: 5px;
    }

    #addTag:hover {
        background-color: #dba979;
        border: none;
    }

    #addTagModal {
        position: fixed;
        left: 50vw;
        top: 50vh;
        transform: translate(-50%, -50%);

        width: 280px;
        height: 40px;
        border-radius: 10px;
        background-color: #dba979;
        border: 1px solid black;
        box-shadow: 0 0 5px;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }

    #addTagModal > input {
        margin: 0;
        margin-left: 25px;
        font-size: 18px;

        background: none;
        border: none;

        cursor: text;
    }

    #addTagModal > input:focus {
        outline: none;
    }

    #addTagModal > button {
        margin: 0;
        margin-right: 25px;
    }

    #addItemModal {
        position: fixed;
        left: 50vw;
        top: 50vh;
        transform: translate(-50%, -50%);

        width: 400px;
        height: 400px;
        border-radius: 10px;
        background-color: #dba979;
        border: 1px solid black;
        box-shadow: 0 0 5px;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    #titleBox {
        width: 350px;
        height: 50px;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: start;

        margin-top: 20px;
        margin-bottom: 15px;
    }

    #titleBox > img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 5px;

        margin-left: 5px;
        margin-right: 10px;

        display: var(--itemThumbnailValid);
    }

    #titleBox > p {
        font-size: 40px;
        font-weight: 500;
    }

    #addItemModal > form {
        width: 350px;
        /* height: 100%; */

        display: flex;
        flex-direction: column;
    }

    #addItemModal > form > label {
        font-size: 12px;
        font-weight: 500;

        margin-bottom: 5px;
    }

    #addItemModal > form > input {
        height: 25px;
        border: 1.5px solid gray;
        border-radius: 5px;

        padding-left: 5px;

        margin-bottom: 10px;
    }

    #confirmBtnBox {
        height: 50px;

        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        gap: 10px;

        margin-top: 10px;
        margin-bottom: 10px;
    }

    #confirmBtnBox > button, #confirmBtnBox > input {
        border: 1px solid gray;
        width: 60px;
        height: 25px;
        border-radius: 4px;
    }

    #confirmBtnBox > input {
        border: none;
        background-color: #ecca9c;
        color: white;
    }

    #addItem {
        width: 50px;
        height: 20px;
        background-color: #afd198;
        border: none;
        cursor: pointer;
        border-radius: 4px;

        margin-left: auto;
    }

    #addItem:hover {
        background-color: #9cb58b;
    }
</style>
