import { useState } from "react"

export async function file2dataUrl(file: File): Promise<string> {
  if (!(file instanceof File)) throw new TypeError()
  const fileReader = new FileReader()
  await new Promise((resolve, reject) => {
    fileReader.addEventListener("load", resolve)
    fileReader.addEventListener("error", reject)
    fileReader.readAsDataURL(file)
  })
  return fileReader.result as string
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
      <main>
        <h1>Event NameCard Generator</h1>
        <button onClick={onClickFolderSelectButton}>
          Select icon images folder
        </button>
      </main>
    )
  }

  if (images.length === 0)
    throw new Error("There are no image files in the specified folder.")

  return <>{images.length} images</>
}

export default App
