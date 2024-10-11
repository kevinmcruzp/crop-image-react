import Image from "next/image"
import { MouseEvent, useState } from "react"
import { useDropzone } from "react-dropzone"
import Cropper from "react-easy-crop"
import { getCroppedImg } from '../utils/canvasUtils'

const aspects = [
  { value: 1 / 1, label: 'Square' },
  { value: 4 / 3, label: 'Landscape' },
  { value: 3 / 4, label: 'Portrait' },
  { value: 16 / 9, label: 'Widescreen' }
]

export default function Home() {
  const [imageSrc, setImageSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ width: number, height: number }>({ width: 0, height: 0 })
  const [croppedImage, setCroppedImage] = useState(null)
  const [aspect, setAspect] = useState(aspects[0].value)

  const onCropComplete = (croppedArea: unknown, croppedAreaPixels: { width: number, height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)

      const response = await fetch(croppedImage)
      const blob = await response.blob()

      const file = new File([blob], 'croppedImage.jpg', { type: 'image/jpeg' })
      console.log('file: ', file)

      setCroppedImage(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 1) {
        const selectedImagePreview = acceptedFiles.map((image: File) => {
          return URL.createObjectURL(image)
        })

        setImageSrc(selectedImagePreview[0])
      }
    }
  })

  const onClose = () => {
    setCroppedImage(null)
  }

  function handleClear (e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    setImageSrc('')
    setZoom(1)
    setRotation(0)
    setCroppedImage(null)
  }

  return (
    <div className="flex w-screen h-screen justify-center items-center relative flex-col">
      <div className={`flex justify-center items-center h-36 w-80 rounded-md ${imageSrc ? 'bg-slate-100' : 'bg-slate-500'} relative`} {...getRootProps()}>
        {imageSrc ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        ) : (
          <div className="w-4/5">
            <input {...getInputProps()} />

            <div className="dropzone">
              {isDragActive
                ? <p className="text-center">Drop the files here ...</p>
                : <p>Drag n drop some files here, or click to select files</p>
              }
            </div>
          </div>
        )}

      {imageSrc && (
        <div 
          className="
            flex absolute top-2 right-2 bg-slate-600 rounded-full items-center justify-center p-1
            hover:bg-slate-500 transition-colors duration-300 ease-in-out
          "  
        >
          <button onClick={handleClear} >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      </div>

      {imageSrc && (
        <div className="flex flex-col gap-4 w-80">
          <div className="flex flex-col w-80">
            <p className="text-sm">Rotate: {rotation}</p>
            <input
              type="range"
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              min={0}
              max={360}
            />
          </div>

          <div className="flex flex-col w-80">
            <p className="text-sm">Zoom: {zoom}</p>
            <input
              type="range"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              min={1}
              max={4}
              step={0.1}
            />
          </div>

          <div className="flex flex-col w-80">
            <p className="text-sm">Aspect Ratio</p>
            <select
              value={aspect}
              onChange={(e) => setAspect(parseFloat(e.target.value))}
              className="p-1 rounded-sm bg-slate-800 gap-2"
            >
              {aspects.map((aspect) => (
                <option key={aspect.value} value={aspect.value}>{aspect.label}</option>
              ))}
            </select>
          </div>
          <button className="bg-slate-700 rounded-sm py-2" onClick={showCroppedImage}>Crop</button>
        </div>
      )}

      {croppedImage && (
        <div className="flex w-screen h-screen absolute bg-black opacity-90" onClick={onClose} />
      )}

      {croppedImage && (
        <Image src={croppedImage} alt="Preview Image" width={500} height={500} className="absolute" />
      )}
    </div>
  )
}
