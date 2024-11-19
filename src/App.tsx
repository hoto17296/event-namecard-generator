import { useState } from "react"
import style from "./App.module.css"

async function file2dataUrl(file: File): Promise<string> {
  if (!(file instanceof File)) throw new TypeError()
  const fileReader = new FileReader()
  await new Promise((resolve, reject) => {
    fileReader.addEventListener("load", resolve)
    fileReader.addEventListener("error", reject)
    fileReader.readAsDataURL(file)
  })
  return fileReader.result as string
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return arr.flatMap((_, i, __) => (i % size ? [] : [arr.slice(i, i + size)]))
}

function App() {
  const [images, setImages] = useState<string[]>()

  if (!window.showDirectoryPicker)
    throw new Error("This browser does not support the File System Access API.")

  async function onClickFolderSelectButton() {
    const images: string[] = []
    for await (const [_, handle] of await window.showDirectoryPicker()) {
      if (handle.kind !== "file") continue
      const file = await handle.getFile()
      if (!file.type.match(/^image/)) continue
      images.push(await file2dataUrl(file))
    }
    setImages(images)
  }

  if (images === undefined) {
    return (
      <main className={style.App}>
        <h1>Event NameCard Generator</h1>
        <button onClick={onClickFolderSelectButton}>
          Select icon images folder
        </button>
      </main>
    )
  }

  if (images.length === 0)
    throw new Error("There are no image files in the specified folder.")

  const cardsPerPage = 8
  return (
    <main className={style.App}>
      {chunkArray(images, cardsPerPage).map((pageImages, idx) => (
        <div key={idx} className={style.page}>
          {pageImages.map((image, idx) => (
            <div key={idx} className={style.card}>
              <img src={image} />
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}

export default App
