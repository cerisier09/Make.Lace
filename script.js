// ==================================================
// Make.Lace
// ==================================================


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
// 設定
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
// グリッド
// ==================================================

const grid =
    document.getElementById("grid");

const gridViewport =
    document.getElementById(
        "gridViewport"
    );


// ==================================================
// ズーム
// ==================================================

const zoomOutButton =
    document.getElementById(
        "zoomOutButton"
    );

const zoomInButton =
    document.getElementById(
        "zoomInButton"
    );

const zoomResetButton =
    document.getElementById(
        "zoomResetButton"
    );

const zoomLabel =
    document.getElementById(
        "zoomLabel"
    );


// ==================================================
// タイトル
// ==================================================

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

let editingArtworkId = null;


// ==================================================
// グリッドサイズ
// ==================================================

let cellSize = 30;


// ==================================================
// ズーム
// ==================================================

let gridZoom = 1;

let gridPanX = 0;

let gridPanY = 0;


// ==================================================
// 2本指操作
// ==================================================

const activePointers =
    new Map();


let pinchStartDistance = 0;

let pinchStartZoom = 1;

let pinchStartMid = {
    x: 0,
    y: 0
};


let pinchStartRect = null;

let pinchContentX = 0;

let pinchContentY = 0;


// ==================================================
// 1本指操作
// ==================================================

let pendingCell = null;

let pointerMoved = false;


// ==================================================
// ホーム → 新しく作る
// ==================================================

newArtworkButton.addEventListener(
    "click",
    () => {

        editingArtworkId = null;


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
// 設定 → ホーム
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
            Number(
                widthInput.value
            );


        currentHeight =
            Number(
                heightInput.value
            );


        if (
            currentArtworkName === ""
        ) {

            currentArtworkName =
                "無題";

        }


        if (
            !Number.isInteger(
                currentWidth
            ) ||
            !Number.isInteger(
                currentHeight
            ) ||
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


        editingArtworkId = null;


        editorTitle.textContent =
            currentArtworkName;


        settingScreen.style.display =
            "none";


        editorScreen.style.display =
            "flex";


        createGrid(
            currentWidth,
            currentHeight
        );

    }
);


// ==================================================
// グリッドのマスサイズを決める
// ==================================================

function calculateCellSize(
    width,
    height
) {

    const viewportWidth =
        gridViewport.clientWidth - 20;

    const viewportHeight =
        gridViewport.clientHeight - 20;


    if (
        viewportWidth <= 0 ||
        viewportHeight <= 0
    ) {

        return 30;

    }


    /*
     * 初期表示では、
     * 横・縦のどちらも画面内に
     * できるだけ収まるようにする。
     */

    const sizeByWidth =
        viewportWidth / width;


    const sizeByHeight =
        viewportHeight / height;


    let size =
        Math.min(
            sizeByWidth,
            sizeByHeight,
            50
        );


    /*
     * 小さくなりすぎないようにする
     */

    size =
        Math.max(
            8,
            size
        );


    return size;

}


// ==================================================
// グリッドを作る
// ==================================================

function createGrid(
    width,
    height,
    pattern = null
) {

    grid.innerHTML = "";


    currentWidth =
        width;

    currentHeight =
        height;


    /*
     * グリッドを作る前に
     * 初期状態をリセット
     */

    gridZoom = 1;

    gridPanX = 0;

    gridPanY = 0;


    /*
     * CSS Gridの列数
     */

    grid.style.gridTemplateColumns =
        `repeat(${width}, var(--cell-size))`;


    /*
     * マスを作る
     */

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
                row * width +
                column;


            const cell =
                document.createElement(
                    "div"
                );


            cell.classList.add(
                "cell"
            );


            /*
             * 保存データがある場合
             */

            if (
                pattern &&
                pattern[index]
            ) {

                cell.classList.add(
                    "filled"
                );

            }


            /*
             * 1本指で押した
             */

            cell.addEventListener(
                "pointerdown",
                (event) => {

                    event.preventDefault();

                    pendingCell =
                        cell;

                    pointerMoved =
                        false;

                }
            );


            grid.appendChild(
                cell
            );

        }

    }


    /*
     * レイアウトが確定してから
     * マスサイズを設定
     */

    requestAnimationFrame(
        () => {

            cellSize =
                calculateCellSize(
                    width,
                    height
                );


            grid.style.setProperty(
                "--cell-size",
                `${cellSize}px`
            );


            updateZoom();

        }
    );

}


// ==================================================
// ズーム表示
// ==================================================

function updateZoom() {

    grid.style.transform =
        `translate(
            ${gridPanX}px,
            ${gridPanY}px
        )
        scale(${gridZoom})`;


    zoomLabel.textContent =
        `${Math.round(
            gridZoom * 100
        )}%`;

}


// ==================================================
// ズーム倍率
// ==================================================

function setGridZoom(
    value
) {

    gridZoom =
        Math.max(
            0.5,
            Math.min(
                4,
                value
            )
        );


    updateZoom();

}


// ==================================================
// ズームリセット
// ==================================================

function resetZoom() {

    gridZoom = 1;

    gridPanX = 0;

    gridPanY = 0;

    updateZoom();

}


// ==================================================
// ズームボタン
// ==================================================

zoomOutButton.addEventListener(
    "click",
    () => {

        setGridZoom(
            gridZoom - 0.25
        );

    }
);


zoomInButton.addEventListener(
    "click",
    () => {

        setGridZoom(
            gridZoom + 0.25
        );

    }
);


zoomResetButton.addEventListener(
    "click",
    resetZoom
);


// ==================================================
// マスを塗る
// ==================================================

function paintCell(
    cell
) {

    if (
        currentTool === "pen"
    ) {

        cell.classList.add(
            "filled"
        );

    }

    else {

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

        currentTool =
            "pen";


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

        currentTool =
            "eraser";


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

        document
            .querySelectorAll(
                ".cell"
            )
            .forEach(
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
    saveArtwork
);


// ==================================================
// 作品保存
// ==================================================

function saveArtwork() {

    const pattern = [];


    document
        .querySelectorAll(
            ".cell"
        )
        .forEach(
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


    /*
     * 既存作品
     */

    if (
        editingArtworkId !== null
    ) {

        const index =
            artworks.findIndex(
                (artwork) =>
                    artwork.id ===
                    editingArtworkId
            );


        if (
            index !== -1
        ) {

            artworks[index] = {

                id:
                    editingArtworkId,

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


    /*
     * 新しい作品
     */

    else {

        artworks.push({

            id:
                Date.now(),

            name:
                currentArtworkName,

            width:
                currentWidth,

            height:
                currentHeight,

            pattern:
                pattern

        });

    }


    localStorage.setItem(
        "makeLaceArtworks",
        JSON.stringify(
            artworks
        )
    );


    editingArtworkId =
        null;


    editorScreen.style.display =
        "none";


    homeScreen.style.display =
        "flex";


    alert(
        "編み図を保存しました！"
    );

}


// ==================================================
// 保存作品取得
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

        return JSON.parse(
            data
        );

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
// 編み図一覧
// ==================================================

function displayArtworks() {

    artworkList.innerHTML =
        "";


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

            artworkList.appendChild(
                createArtworkCard(
                    artwork
                )
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


    /*
     * プレビュー
     */

    const preview =
        document.createElement(
            "div"
        );


    preview.classList.add(
        "artwork-preview"
    );


    preview.style.gridTemplateColumns =
        `repeat(
            ${artwork.width},
            1fr
        )`;


    artwork.pattern.forEach(
        (filled) => {

            const cell =
                document.createElement(
                    "div"
                );


            cell.classList.add(
                "preview-cell"
            );


            if (
                filled
            ) {

                cell.classList.add(
                    "filled"
                );

            }


            preview.appendChild(
                cell
            );

        }
    );


    /*
     * 作品名
     */

    const name =
        document.createElement(
            "div"
        );


    name.classList.add(
        "artwork-name"
    );


    name.textContent =
        artwork.name;


    /*
     * サイズ
     */

    const size =
        document.createElement(
            "div"
        );


    size.classList.add(
        "artwork-size"
    );


    size.textContent =
        `${artwork.width} × ${artwork.height} マス`;


    /*
     * 編集
     */

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


    /*
     * 削除
     */

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


    /*
     * カード
     */

    card.addEventListener(
        "click",
        () => {

            openArtwork(
                artwork
            );

        }
    );


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
// 保存作品を開く
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


    artworksScreen.style.display =
        "none";


    editorScreen.style.display =
        "flex";


    createGrid(
        artwork.width,
        artwork.height,
        artwork.pattern
    );

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


    if (
        !confirmed
    ) {

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
// 一覧 → ホーム
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
    downloadPNG
);


// ==================================================
// PNGとして保存
// ==================================================

function downloadPNG() {

    const canvas =
        document.createElement(
            "canvas"
        );


    /*
     * PNGの1マスの大きさ
     */

    const outputCellSize =
        50;


    canvas.width =
        currentWidth *
        outputCellSize;


    canvas.height =
        currentHeight *
        outputCellSize;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
     * 白背景
     */

    ctx.fillStyle =
        "white";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
     * 現在のマス
     */

    const cells =
        document.querySelectorAll(
            ".cell"
        );


    cells.forEach(
        (cell, index) => {

            const row =
                Math.floor(
                    index /
                    currentWidth
                );


            const column =
                index %
                currentWidth;


            /*
             * 黒いドット
             */

            if (
                cell.classList.contains(
                    "filled"
                )
            ) {

                ctx.fillStyle =
                    "black";


                ctx.fillRect(

                    column *
                        outputCellSize,

                    row *
                        outputCellSize,

                    outputCellSize,

                    outputCellSize

                );

            }


            /*
             * マス目
             */

            ctx.strokeStyle =
                "rgba(0, 0, 0, 0.35)";


            ctx.lineWidth =
                1;


            ctx.strokeRect(

                column *
                    outputCellSize,

                row *
                    outputCellSize,

                outputCellSize,

                outputCellSize

            );

        }
    );


    /*
     * PNG作成
     */

    canvas.toBlob(
        (blob) => {

            if (!blob) {

                alert(
                    "PNGの作成に失敗しました。"
                );

                return;

            }


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


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


// ==================================================
// 2点間の距離
// ==================================================

function distanceBetween(
    a,
    b
) {

    return Math.hypot(
        b.x - a.x,
        b.y - a.y
    );

}


// ==================================================
// 2点の中心
// ==================================================

function midpointBetween(
    a,
    b
) {

    return {

        x:
            (a.x + b.x) / 2,

        y:
            (a.y + b.y) / 2

    };

}


// ==================================================
// 2本指を置いた
// ==================================================

gridViewport.addEventListener(
    "pointerdown",
    (event) => {

        activePointers.set(
            event.pointerId,
            {
                x: event.clientX,
                y: event.clientY
            }
        );


        /*
         * 2本指になった
         */

        if (
            activePointers.size === 2
        ) {

            const points =
                Array.from(
                    activePointers.values()
                );


            const mid =
                midpointBetween(
                    points[0],
                    points[1]
                );


            const distance =
                distanceBetween(
                    points[0],
                    points[1]
                );


            pinchStartDistance =
                distance;


            pinchStartZoom =
                gridZoom;


            pinchStartMid =
                mid;


            /*
             * 2本指を置いた瞬間の
             * グリッド位置
             */

            pinchStartRect =
                grid.getBoundingClientRect();


            /*
             * 2本指の中心が
             * グリッド内のどこにあるか
             */

            pinchContentX =
                (
                    mid.x -
                    pinchStartRect.left
                ) /
                gridZoom;


            pinchContentY =
                (
                    mid.y -
                    pinchStartRect.top
                ) /
                gridZoom;


            /*
             * 1本指の描画をキャンセル
             */

            pendingCell =
                null;


            pointerMoved =
                true;


            event.preventDefault();

        }

    },

    {
        passive: false
    }

);


// ==================================================
// 2本指を動かす
// ==================================================

gridViewport.addEventListener(
    "pointermove",
    (event) => {

        if (
            !activePointers.has(
                event.pointerId
            )
        ) {

            return;

        }


        const previous =
            activePointers.get(
                event.pointerId
            );


        const movement =
            Math.hypot(

                event.clientX -
                    previous.x,

                event.clientY -
                    previous.y

            );


        if (
            movement > 5
        ) {

            pointerMoved =
                true;

        }


        activePointers.set(
            event.pointerId,
            {
                x: event.clientX,
                y: event.clientY
            }
        );


        /*
         * 2本指操作
         */

        if (
            activePointers.size === 2 &&
            pinchStartDistance > 0 &&
            pinchStartRect
        ) {

            const points =
                Array.from(
                    activePointers.values()
                );


            const mid =
                midpointBetween(
                    points[0],
                    points[1]
                );


            const distance =
                distanceBetween(
                    points[0],
                    points[1]
                );


            /*
             * ピンチによるズーム
             */

            let newZoom =
                pinchStartZoom *
                (
                    distance /
                    pinchStartDistance
                );


            newZoom =
                Math.max(
                    0.5,
                    Math.min(
                        4,
                        newZoom
                    )
                );


            gridZoom =
                newZoom;


            /*
             * 2本指の中心を
             * 同じ場所に固定する
             */

            gridPanX =
                (
                    mid.x -
                    pinchStartRect.left -
                    pinchContentX *
                    gridZoom
                );


            gridPanY =
                (
                    mid.y -
                    pinchStartRect.top -
                    pinchContentY *
                    gridZoom
                );


            updateZoom();


            pendingCell =
                null;


            event.preventDefault();

        }

    },

    {
        passive: false
    }

);


// ==================================================
// 指を離した
// ==================================================

gridViewport.addEventListener(
    "pointerup",
    (event) => {

        /*
         * 1本指タップなら塗る
         */

        if (
            activePointers.size === 1 &&
            pendingCell &&
            !pointerMoved
        ) {

            paintCell(
                pendingCell
            );

        }


        activePointers.delete(
            event.pointerId
        );


        /*
         * 2本指操作終了
         */

        if (
            activePointers.size < 2
        ) {

            pinchStartDistance =
                0;

            pinchStartRect =
                null;

        }


        pendingCell =
            null;


        pointerMoved =
            false;

    }
);


// ==================================================
// 指をキャンセル
// ==================================================

gridViewport.addEventListener(
    "pointercancel",
    (event) => {

        activePointers.delete(
            event.pointerId
        );


        pinchStartDistance =
            0;


        pinchStartRect =
            null;


        pendingCell =
            null;


        pointerMoved =
            false;

    }
);


// ==================================================
// iPad標準ジェスチャーを無効化
// ==================================================

gridViewport.style.touchAction =
    "none";


grid.style.touchAction =
    "none";
