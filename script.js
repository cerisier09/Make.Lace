// ==================================================
// 画面
// ==================================================

const homeScreen =
    document.getElementById("homeScreen");

const settingScreen =
    document.getElementById("settingScreen");

const editorScreen =
    document.getElementById("editorScreen");

const artworksScreen =
    document.getElementById("artworksScreen");



// ==================================================
// ホーム
// ==================================================

const newArtworkButton =
    document.getElementById("newArtworkButton");

const artworksButton =
    document.getElementById("artworksButton");



// ==================================================
// マス目設定
// ==================================================

const backButton =
    document.getElementById("backButton");

const createButton =
    document.getElementById("createButton");



// ==================================================
// 編集
// ==================================================

const editorBackButton =
    document.getElementById("editorBackButton");

const clearButton =
    document.getElementById("clearButton");

const saveButton =
    document.getElementById("saveButton");

const pngButton =
    document.getElementById("pngButton");

const penButton =
    document.getElementById("penButton");

const eraserButton =
    document.getElementById("eraserButton");



// ==================================================
// 一覧
// ==================================================

const artworksBackButton =
    document.getElementById(
        "artworksBackButton"
    );

const artworkList =
    document.getElementById(
        "artworkList"
    );



// ==================================================
// その他
// ==================================================

const grid =
    document.getElementById("grid");

const editorTitle =
    document.getElementById(
        "editorTitle"
    );



// ==================================================
// 現在の作品
// ==================================================

let currentArtworkName = "";

let currentWidth = 8;

let currentHeight = 8;

let currentTool = "pen";

// 編集中の作品ID
let editingArtworkId = null;



// ==================================================
// ホーム → 新しく作る
// ==================================================

newArtworkButton.addEventListener(
    "click",
    () => {

        // 新規作品なので
        // 編集IDをリセット

        editingArtworkId = null;


        // 入力欄をリセット

        document.getElementById(
            "artworkName"
        ).value = "";


        document.getElementById(
            "widthInput"
        ).value = 8;


        document.getElementById(
            "heightInput"
        ).value = 8;


        homeScreen.style.display =
            "none";

        settingScreen.style.display =
            "flex";

    }
);



// ==================================================
// 設定画面 → ホーム
// ==================================================

backButton.addEventListener(
    "click",
    () => {

        settingScreen.style.display =
            "none";

        homeScreen.style.display =
            "flex";

    }
);



// ==================================================
// 新しい作品を作成
// ==================================================

createButton.addEventListener(
    "click",
    () => {

        const nameInput =
            document.getElementById(
                "artworkName"
            );

        const widthInput =
            document.getElementById(
                "widthInput"
            );

        const heightInput =
            document.getElementById(
                "heightInput"
            );


        currentArtworkName =
            nameInput.value.trim();


        currentWidth =
            Number(widthInput.value);


        currentHeight =
            Number(heightInput.value);



        if (
            currentArtworkName === ""
        ) {

            currentArtworkName =
                "無題";

        }



        if (
            currentWidth < 1 ||
            currentHeight < 1
        ) {

            alert(
                "横と縦のマス数を入力してください。"
            );

            return;

        }



        if (
            currentWidth > 50 ||
            currentHeight > 50
        ) {

            alert(
                "マス数は50までです。"
            );

            return;

        }



        // 新規作成

        editingArtworkId = null;


        editorTitle.textContent =
            currentArtworkName;


        createGrid(
            currentWidth,
            currentHeight
        );


        settingScreen.style.display =
            "none";

        editorScreen.style.display =
            "flex";

    }
);



// ==================================================
// マス目を作る
// ==================================================

function createGrid(
    width,
    height,
    pattern = null
) {

    grid.innerHTML = "";


    grid.style.gridTemplateColumns =
        `repeat(${width}, 1fr)`;


    for (
        let row = 0;
        row < height;
        row++
    ) {

        for (
            let column = 0;
            column < width;
            column++
        ) {

            const index =
                row * width + column;


            const cell =
                document.createElement(
                    "div"
                );


            cell.classList.add(
                "cell"
            );



            // 保存されていた模様があれば
            // 復元する

            if (
                pattern &&
                pattern[index]
            ) {

                cell.classList.add(
                    "filled"
                );

            }



            cell.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    paintCell(cell);

                }
            );


            grid.appendChild(
                cell
            );

        }

    }

}



// ==================================================
// マスを塗る
// ==================================================

function paintCell(cell) {

    if (
        currentTool === "pen"
    ) {

        cell.classList.add(
            "filled"
        );

    }

    else if (
        currentTool === "eraser"
    ) {

        cell.classList.remove(
            "filled"
        );

    }

}



// ==================================================
// ペン
// ==================================================

penButton.addEventListener(
    "click",
    () => {

        currentTool = "pen";


        penButton.classList.add(
            "active"
        );


        eraserButton.classList.remove(
            "active"
        );

    }
);



// ==================================================
// 消しゴム
// ==================================================

eraserButton.addEventListener(
    "click",
    () => {

        currentTool = "eraser";


        eraserButton.classList.add(
            "active"
        );


        penButton.classList.remove(
            "active"
        );

    }
);



// ==================================================
// 全消去
// ==================================================

clearButton.addEventListener(
    "click",
    () => {

        const cells =
            document.querySelectorAll(
                ".cell"
            );


        cells.forEach(
            (cell) => {

                cell.classList.remove(
                    "filled"
                );

            }
        );

    }
);



// ==================================================
// 編集画面 → 設定画面
// ==================================================

editorBackButton.addEventListener(
    "click",
    () => {

        editorScreen.style.display =
            "none";

        settingScreen.style.display =
            "flex";

    }
);



// ==================================================
// 保存
// ==================================================

saveButton.addEventListener(
    "click",
    () => {

        saveArtwork();

    }
);



// ==================================================
// 作品を保存
// ==================================================

function saveArtwork() {

    const cells =
        document.querySelectorAll(
            ".cell"
        );


    const pattern = [];


    cells.forEach(
        (cell) => {

            pattern.push(
                cell.classList.contains(
                    "filled"
                )
            );

        }
    );



    let artworks =
        getArtworks();



    // ==================================================
    // 既存作品を編集している場合
    // ==================================================

    if (
        editingArtworkId !== null
    ) {

        const index =
            artworks.findIndex(
                (artwork) =>
                    artwork.id ===
                    editingArtworkId
            );


        if (index !== -1) {

            artworks[index] = {

                id: editingArtworkId,

                name:
                    currentArtworkName,

                width:
                    currentWidth,

                height:
                    currentHeight,

                pattern:
                    pattern

            };

        }

    }



    // ==================================================
    // 新しい作品の場合
    // ==================================================

    else {

        const artwork = {

            id: Date.now(),

            name:
                currentArtworkName,

            width:
                currentWidth,

            height:
                currentHeight,

            pattern:
                pattern

        };


        artworks.push(
            artwork
        );

    }



    // 保存

    localStorage.setItem(
        "makeLaceArtworks",
        JSON.stringify(
            artworks
        )
    );



    // 編集IDをリセット

    editingArtworkId = null;



    // ホームに戻る

    editorScreen.style.display =
        "none";

    homeScreen.style.display =
        "flex";


    alert(
        "編み図を保存しました！"
    );

}



// ==================================================
// 保存作品を取得
// ==================================================

function getArtworks() {

    const data =
        localStorage.getItem(
            "makeLaceArtworks"
        );


    if (!data) {

        return [];

    }


    try {

        return JSON.parse(data);

    }

    catch (error) {

        return [];

    }

}



// ==================================================
// 編み図を見る
// ==================================================

artworksButton.addEventListener(
    "click",
    () => {

        homeScreen.style.display =
            "none";

        artworksScreen.style.display =
            "flex";


        displayArtworks();

    }
);



// ==================================================
// 編み図一覧を表示
// ==================================================

function displayArtworks() {

    artworkList.innerHTML = "";


    const artworks =
        getArtworks();



    if (
        artworks.length === 0
    ) {

        const emptyMessage =
            document.createElement(
                "p"
            );


        emptyMessage.textContent =
            "まだ編み図がありません";


        emptyMessage.style.color =
            "rgb(90, 180, 220)";


        emptyMessage.style.fontSize =
            "18px";


        artworkList.appendChild(
            emptyMessage
        );


        return;

    }



    artworks.forEach(
        (artwork) => {

            const card =
                createArtworkCard(
                    artwork
                );


            artworkList.appendChild(
                card
            );

        }
    );

}



// ==================================================
// 作品カード
// ==================================================

function createArtworkCard(
    artwork
) {

    const card =
        document.createElement(
            "div"
        );


    card.classList.add(
        "artwork-card"
    );



    // ==================================================
    // プレビュー
    // ==================================================

    const preview =
        document.createElement(
            "div"
        );


    preview.classList.add(
        "artwork-preview"
    );


    preview.style.gridTemplateColumns =
        `repeat(${artwork.width}, 1fr)`;


    artwork.pattern.forEach(
        (filled) => {

            const cell =
                document.createElement(
                    "div"
                );


            cell.classList.add(
                "preview-cell"
            );


            if (filled) {

                cell.classList.add(
                    "filled"
                );

            }


            preview.appendChild(
                cell
            );

        }
    );



    // ==================================================
    // 作品名
    // ==================================================

    const name =
        document.createElement(
            "div"
        );


    name.classList.add(
        "artwork-name"
    );


    name.textContent =
        artwork.name;



    // ==================================================
    // サイズ
    // ==================================================

    const size =
        document.createElement(
            "div"
        );


    size.classList.add(
        "artwork-size"
    );


    size.textContent =
        `${artwork.width} × ${artwork.height} マス`;



    // ==================================================
    // 編集ボタン
    // ==================================================

    const editButton =
        document.createElement(
            "button"
        );


    editButton.classList.add(
        "edit-artwork-button"
    );


    editButton.textContent =
        "編集";



    editButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            openArtwork(
                artwork
            );

        }
    );



    // ==================================================
    // 削除ボタン
    // ==================================================

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.classList.add(
        "delete-artwork-button"
    );


    deleteButton.textContent =
        "削除";



    deleteButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            deleteArtwork(
                artwork.id
            );

        }
    );



    // ==================================================
    // カードをクリックして編集
    // ==================================================

    card.addEventListener(
        "click",
        () => {

            openArtwork(
                artwork
            );

        }
    );



    // ==================================================
    // カードに追加
    // ==================================================

    card.appendChild(
        preview
    );


    card.appendChild(
        name
    );


    card.appendChild(
        size
    );


    card.appendChild(
        editButton
    );


    card.appendChild(
        deleteButton
    );


    return card;

}



// ==================================================
// 保存した作品を開く
// ==================================================

function openArtwork(
    artwork
) {

    currentArtworkName =
        artwork.name;


    currentWidth =
        artwork.width;


    currentHeight =
        artwork.height;


    editingArtworkId =
        artwork.id;



    editorTitle.textContent =
        artwork.name;



    createGrid(
        artwork.width,
        artwork.height,
        artwork.pattern
    );



    artworksScreen.style.display =
        "none";


    editorScreen.style.display =
        "flex";

}



// ==================================================
// 作品削除
// ==================================================

function deleteArtwork(
    id
) {

    const confirmed =
        confirm(
            "この編み図を削除しますか？"
        );


    if (!confirmed) {

        return;

    }



    let artworks =
        getArtworks();


    artworks =
        artworks.filter(
            (artwork) =>
                artwork.id !== id
        );


    localStorage.setItem(
        "makeLaceArtworks",
        JSON.stringify(
            artworks
        )
    );


    displayArtworks();

}



// ==================================================
// 編み図一覧 → ホーム
// ==================================================

artworksBackButton.addEventListener(
    "click",
    () => {

        artworksScreen.style.display =
            "none";

        homeScreen.style.display =
            "flex";

    }
);

// ==================================================
// PNG保存
// ==================================================

pngButton.addEventListener(
    "click",
    () => {

        downloadPNG();

    }
);



// ==================================================
// 編み図をPNGとして保存
// ==================================================

function downloadPNG() {

    const canvas =
        document.createElement("canvas");


    const cellSize = 50;


    canvas.width =
        currentWidth * cellSize;


    canvas.height =
        currentHeight * cellSize;


    const ctx =
        canvas.getContext("2d");



    // 背景

    ctx.fillStyle =
        "white";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    // 現在のマス目

    const cells =
        document.querySelectorAll(
            ".cell"
        );



    cells.forEach(
        (cell, index) => {

            const row =
                Math.floor(
                    index / currentWidth
                );


            const column =
                index % currentWidth;



            // 塗られているマス

            if (
                cell.classList.contains(
                    "filled"
                )
            ) {

                ctx.fillStyle =
                    "rgb(90, 180, 220)";


                ctx.fillRect(

                    column * cellSize,

                    row * cellSize,

                    cellSize,

                    cellSize

                );

            }



            // マス目の線

            ctx.strokeStyle =
                "rgba(90, 180, 220, 0.35)";


            ctx.lineWidth = 1;


            ctx.strokeRect(

                column * cellSize,

                row * cellSize,

                cellSize,

                cellSize

            );

        }
    );



    // PNGに変換

    canvas.toBlob(
        (blob) => {

            if (!blob) {

                alert(
                    "PNGの作成に失敗しました。"
                );

                return;

            }



            // ダウンロード用リンク

            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;


            // ファイル名

            link.download =
                `${currentArtworkName}.png`;


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );

        },

        "image/png"

    );

}