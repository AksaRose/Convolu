# CNN Convolution Learning Tool

An interactive web-based tool to learn and visualize how convolutional neural network kernels work.

## Features

- **7×7 Input Image Grid**: Grayscale image with pixel values ranging from 0 to 1
- **4×4 Editable Kernel**: Modify kernel values and see real-time changes
- **4×4 Convolution Output**: Visual representation of the convolution result
- **Interactive Editing**: Click on any cell to edit its value
- **Randomization**: Generate random input images or kernels
- **Visual Feedback**: Color-coded cells showing intensity and value ranges

## How to Use

1. Open `index.html` in a web browser
2. **Edit Input Image**: Click on any cell in the 7×7 input grid to change its value (0-1)
3. **Edit Kernel**: Click on any cell in the 4×4 kernel grid to modify kernel values
4. **View Output**: The 4×4 output grid automatically updates when you change values
5. **Randomize**: Use the buttons to generate random input images or kernels

## How Convolution Works

1. The 4×4 kernel slides over the 7×7 input image
2. At each position, element-wise multiplication is performed between the kernel and the overlapping region
3. All multiplied values are summed to produce a single output pixel
4. The output size is calculated as: (Input Size - Kernel Size + 1) = (7 - 4 + 1) = 4×4

## Visual Guide

- **Input Grid**: Grayscale visualization (darker = lower value, lighter = higher value)
- **Kernel Grid**: Color-coded (green tint for positive, red tint for negative, yellow for zero)
- **Output Grid**: Blue-tinted visualization showing the convolution result

## Technical Details

- Pure HTML, CSS, and JavaScript (no dependencies)
- Responsive design that works on desktop and mobile
- Real-time computation of convolution operation


