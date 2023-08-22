import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter

def generate_smooth_matrix_with_obstacles(size=1000):
    matrix = np.zeros((size, size))

    # Create some elliptical obstacles
    y, x = np.ogrid[-size/2:size/2, -size/2:size/2]
    mask1 = 0.2*size**2 > (x**2 + 2.5*y**2)
    mask2 = 0.1*size**2 > ((x-size/4)**2 + (y+size/4)**2)
    mask3 = 0.1*size**2 > ((x+size/4)**2 + (y-size/4)**2)

    # Apply obstacles
    matrix[mask1] = 0.8
    matrix[mask2] = 0.9
    matrix[mask3] = 0.9

    # Create rectangular obstacle
    matrix[int(0.2*size):int(0.4*size), int(0.6*size):int(0.8*size)] = 1.0

    # Apply Gaussian filter for smooth transitions
    matrix = gaussian_filter(matrix, sigma=size*0.02)

    return matrix

matrix = generate_smooth_matrix_with_obstacles()

# Save matrix to CSV file
np.savetxt("obstacle2.csv", matrix, delimiter=",")

# Visualize the matrix
plt.imshow(matrix, cmap="viridis", interpolation='none')
plt.colorbar(label="Locomotion Difficulty")
plt.title("obstacle2")
plt.savefig("obstacle2.png")
plt.show()
