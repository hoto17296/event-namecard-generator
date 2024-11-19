import { Button, Collapse, Form, Segmented, Select, Slider } from "antd"
import { FC, useState } from "react"
import style from "./App.module.css"

const PAPER_SIZES: {
  [key: string]: { label: string; width: number; height: number }
} = {
  a4: { label: "A4", width: 210, height: 297 },
  b4: { label: "B4", width: 257, height: 364 },
}

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

const App: FC<{}> = () => {
  const [form] = Form.useForm()
  const [images, setImages] = useState<string[]>([])
  const [settings, setSettings] = useState<{
    paperSize: string
    paperOrientation: "portrait" | "landscape"
    cardWidth: number
    cardHeight: number
    iconSize: number
    iconMargin: number
    iconBorderRadius: number
  }>({
    paperSize: "a4",
    paperOrientation: "portrait",
    cardWidth: 105.0,
    cardHeight: 74.2,
    iconSize: 40,
    iconMargin: 6,
    iconBorderRadius: 20,
  })

  if (!window.showDirectoryPicker)
    throw new Error("This browser does not support the File System Access API.")

  async function onClickFolderSelectButton() {
    try {
      const images: string[] = []
      for await (const [_, handle] of await window.showDirectoryPicker()) {
        if (handle.kind !== "file") continue
        const file = await handle.getFile()
        if (!file.type.match(/^image/)) continue
        images.push(await file2dataUrl(file))
      }
      setImages(images)
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      throw error
    }
  }

  const paperSize = PAPER_SIZES[settings.paperSize]
  if (!paperSize) throw new Error(`Invalid paper size: ${settings.paperSize}`)
  const [paperWidth, paperHeight] =
    settings.paperOrientation === "portrait"
      ? [paperSize.width, paperSize.height]
      : [paperSize.height, paperSize.width]
  const cardsPerPage =
    Math.floor(paperWidth / settings.cardWidth) *
    Math.floor(paperHeight / settings.cardHeight)

  return (
    <main>
      {chunkArray(images, cardsPerPage).map((pageImages, idx) => (
        <div
          key={idx}
          className={style.Page}
          style={{
            width: `${paperWidth}mm`,
            height: `${paperHeight}mm`,
          }}
        >
          {pageImages.map((image, idx) => (
            <div
              key={idx}
              className={style.Card}
              style={{
                width: `${settings.cardWidth}mm`,
                height: `${settings.cardHeight}mm`,
              }}
            >
              <img
                src={image}
                style={{
                  width: `${settings.iconSize}mm`,
                  height: `${settings.iconSize}mm`,
                  margin: `${settings.iconMargin}mm`,
                  borderRadius: `${settings.iconBorderRadius}%`,
                }}
              />
            </div>
          ))}
        </div>
      ))}

      <Form
        className={style.Widget}
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={settings}
        onValuesChange={(values) => {
          setSettings((prevValues) => ({ ...prevValues, ...values }))
        }}
      >
        <Collapse
          accordion
          defaultActiveKey={["iconImages"]}
          items={[
            {
              key: "iconImages",
              label: "Icon Images",
              children: (
                <Button type="primary" onClick={onClickFolderSelectButton}>
                  Select icon images folder
                </Button>
              ),
            },
            {
              key: "paperSettings",
              label: "Paper Settings",
              children: (
                <>
                  <Form.Item name="paperSize" label="Paper Size">
                    <Select>
                      {Object.entries(PAPER_SIZES).map(([key, value]) => (
                        <Select.Option key={key} value={key}>
                          {value.label} ({value.width}mm x {value.height}mm)
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Paper Orientation" name="paperOrientation">
                    <Segmented
                      options={[
                        { label: "▯ Portrait", value: "portrait" },
                        { label: "▭ Landscape", value: "landscape" },
                      ]}
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "cardSettings",
              label: "Card Settings",
              children: (
                <>
                  <Form.Item label="Card Width" name="cardWidth">
                    <Slider
                      style={{ margin: "0 2em" }}
                      min={50}
                      max={200}
                      step={0.1}
                      marks={{
                        50: "50mm",
                        100: "100mm",
                        150: "150mm",
                        200: "200mm",
                      }}
                    />
                  </Form.Item>

                  <Form.Item label="Card Height" name="cardHeight">
                    <Slider
                      style={{ margin: "0 2em" }}
                      min={50}
                      max={200}
                      step={0.1}
                      marks={{
                        50: "50mm",
                        100: "100mm",
                        150: "150mm",
                        200: "200mm",
                      }}
                    />
                  </Form.Item>

                  <Form.Item label="Icon Size" name="iconSize">
                    <Slider
                      style={{ margin: "0 2em" }}
                      min={20}
                      max={50}
                      marks={{ 20: "20mm", 30: "30mm", 40: "40mm", 50: "50mm" }}
                    />
                  </Form.Item>

                  <Form.Item label="Icon Margin" name="iconMargin">
                    <Slider
                      style={{ margin: "0 2em" }}
                      min={0}
                      max={20}
                      marks={{ 0: "0mm", 10: "10mm", 20: "20mm" }}
                    />
                  </Form.Item>

                  <Form.Item label="Icon Border Radius" name="iconBorderRadius">
                    <Slider
                      style={{ margin: "0 2em" }}
                      min={0}
                      max={50}
                      marks={{ 0: "0%", 25: "25%", 50: "50%" }}
                    />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
      </Form>
    </main>
  )
}

export default App
