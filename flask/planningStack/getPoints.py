'''
This script is used to generate the moisture and shear strength maps from the image.
It is used to generate the maps for the planning stack.
'''

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
import matplotlib.pyplot as plt

def generate_moisture_map_from_image(image_path, smoothness=3):
    # Load and convert image to grayscale
    img = Image.open(image_path).convert('L')  # 'L' mode = grayscale
    moisture_map = np.array(img) / 255.0  # Normalize to [0, 1]

    # Flip the image vertically (need this to maintain original image orientation for shear strength map)
    moisture_map = np.flipud(moisture_map)


    # Smooth the map to remove pixel-level noise
    moisture_map = gaussian_filter(moisture_map, sigma=smoothness)

    return moisture_map

def calculate_shear_strength(moisture_map):
    # If moisture is low, shear strength = moisture
    # If moisture is high, shear strength = 0.25 * moisture + 0.375
    shear_strength_map = np.where(moisture_map < 0.5, moisture_map, 0.25 * moisture_map + 0.375)

    # Add some noise
    noise = np.random.normal(loc=0, scale=0.01, size=moisture_map.shape)
    shear_strength_map += noise

    # Clip values to [0, 1]
    shear_strength_map = np.clip(shear_strength_map, 0, 1)

    return shear_strength_map

# === MAIN EXECUTION ===

# File path to your image
image_path = 'Patchy_Env.png'

# Generate maps
moisture_map = generate_moisture_map_from_image(image_path)
shear_strength_map = calculate_shear_strength(moisture_map)

# Save to CSV
np.savetxt('moisture_map.csv', moisture_map, delimiter=',')
np.savetxt('shear_strength_map.csv', shear_strength_map, delimiter=',')

# Display maps
fig, ax = plt.subplots(1, 2, figsize=(12, 6))
moisture_image = ax[0].imshow(moisture_map, cmap='Blues')
ax[0].set_title('Moisture Map')
plt.colorbar(moisture_image, ax=ax[0], label='Moisture')



shear_image = ax[1].imshow(shear_strength_map, cmap='viridis')
ax[1].set_title('Shear Strength Map')
plt.colorbar(shear_image, ax=ax[1], label='Shear Strength')

plt.gca().invert_yaxis()  # optional: flip y-axis if using image coordinates


plt.tight_layout()
# plt.show()


'''
Two
'''

import numpy as np
import matplotlib.pyplot as plt
from skimage.filters import threshold_multiotsu, gaussian
from skimage.measure import regionprops, label, find_contours
from skimage.segmentation import relabel_sequential
from skimage.morphology import remove_small_objects
from skimage import img_as_ubyte

# ---------------------------
# Step 1: Generate a Fake Reward Map
# ---------------------------
np.random.seed(42)
x, y = np.mgrid[0:100, 0:100]
# reward_map = (np.exp(-((x - 30)**2 + (y - 30)**2) / (2 * 10**2)) +
#               0.8 * np.exp(-((x - 70)**2 + (y - 70)**2) / (2 * 15**2)))
reward_map = shear_strength_map[::10, ::10]
reward_map = gaussian(reward_map, sigma=1)
# reward_map += 0.1 * np.random.random(reward_map.shape)  # Add some noise

# ---------------------------
# Step 2: Multi-Otsu Thresholding to Separate by Intensity
# ---------------------------
num_classes = 2 
thresholds = threshold_multiotsu(reward_map, classes=num_classes)
# Each pixel is assigned an intensity group (0, 1, or 2)
intensity_groups = np.digitize(reward_map, bins=thresholds)

# ---------------------------
# Step 3: Connected Component Labeling Within Each Intensity Group
# ---------------------------
final_labels = np.zeros_like(reward_map, dtype=int)
current_label = 1

# Loop over each intensity group and label connected regions
for i in range(num_classes):
    mask = intensity_groups == i
    # Label connected components (8-connectivity)
    labeled_mask = label(mask, connectivity=2)
    # Shift labels to avoid conflicts
    labeled_mask[labeled_mask > 0] += current_label - 1
    final_labels[mask] = labeled_mask[mask]
    current_label = final_labels.max() + 1
regions = regionprops(final_labels)
for region in regions:
    print(f"Region {region.label} has area: {region.area} pixels")
# ---------------------------
# Step 4: Remove Small Regions (Noise)
# ---------------------------
# Set a minimum area threshold (e.g., 50 pixels)
min_area = reward_map.shape[0] * reward_map.shape[1] * 0.005  # 1% of the total area
# Create an empty array to store filtered labels
labels_filtered = np.zeros_like(final_labels, dtype=int)

# Loop over each region and copy regions that meet the area threshold
for region in regionprops(final_labels):
    if region.area >= min_area:
        labels_filtered[final_labels == region.label] = region.label

# Re-label sequentially to keep labels contiguous
labels_filtered, _, _ = relabel_sequential(labels_filtered)
num_regions_filtered = labels_filtered.max()
print("Total number of regions after manual filtering:", num_regions_filtered)

# ---------------------------
# Step 5: Visualize the Results
# ---------------------------
fig, axes = plt.subplots(1, 3, figsize=(18, 6))

axes[0].imshow(reward_map, cmap='viridis')
axes[0].set_title('Fake Reward Map')
axes[0].axis('off')

axes[1].imshow(intensity_groups, cmap='nipy_spectral')
axes[1].set_title('Intensity Groups (Multi-Otsu)')
axes[1].axis('off')

axes[2].imshow(labels_filtered, cmap='nipy_spectral')
axes[2].set_title('Final Segmentation (Filtered)')
axes[2].axis('off')

plt.tight_layout()


# plt.show()

# ---------------------------
# Step 5: Helper Function for Uniform Sampling Along a Contour
# ---------------------------
def sample_contour_uniformly(contour, num_samples):
    """
    Uniformly sample points along a contour.

    Parameters:
        contour (ndarray): An (N,2) array of (row, col) coordinates.
        num_samples (int): Number of sample points to extract.
    
    Returns:
        ndarray: An (num_samples, 2) array of uniformly sampled (row, col) points.
    """
    # Compute the distances between consecutive contour points
    distances = np.sqrt(np.sum(np.diff(contour, axis=0)**2, axis=1))
    cumulative_distance = np.concatenate(([0], np.cumsum(distances)))
    total_length = cumulative_distance[-1]
    
    # Define equally spaced distances along the contour
    sample_dists = np.linspace(0, total_length, num_samples)
    
    # Interpolate row and col coordinates for the sample distances
    sample_rows = np.interp(sample_dists, cumulative_distance, contour[:, 0])
    sample_cols = np.interp(sample_dists, cumulative_distance, contour[:, 1])
    
    return np.vstack((sample_rows, sample_cols)).T

# ---------------------------
# Step 6: Draw Gradient Direction Arrows on Uniformly Sampled Contour Points
# ---------------------------
line_length = 5       # Length of the drawn arrow (in pixels)
num_samples = 20      # Number of uniformly distributed samples per contour

# Compute global gradients of the reward map
grad_y, grad_x = np.gradient(reward_map)

fig2, ax2 = plt.subplots(figsize=(8, 8))
ax2.imshow(labels_filtered, cmap='viridis')
ax2.set_title('Gradient Directions on Region Boundaries (Uniform Sampling)')
ax2.axis('off')

# Loop over each labeled region (skip background: label 0)
for region_label in np.unique(labels_filtered):
    if region_label == 0:
        continue
    mask = labels_filtered == region_label
    # Use find_contours to get ordered boundary coordinates; level 0.5 works for binary masks.
    contours = find_contours(mask.astype(float), level=0.5)
    
    # Option: choose the longest contour if multiple exist
    if contours:
        contour = max(contours, key=len)
        sampled_coords = sample_contour_uniformly(contour, num_samples)
        
        for (row, col) in sampled_coords:
            # Get the gradient vector at the boundary point (rounded to nearest integer)
            r, c = int(round(row)), int(round(col))
            g_y = grad_y[r, c]
            g_x = grad_x[r, c]
            angle = np.arctan2(g_y, g_x)
            
            # Determine end point for the arrow in the gradient direction
            end_row = row + line_length * np.sin(angle)
            end_col = col + line_length * np.cos(angle)
            
            ax2.arrow(col, row, end_col - col, end_row - row, 
                      head_width=1.5, head_length=2, fc='red', ec='red')

plt.tight_layout()

plt.gca().invert_yaxis()  # optional: flip y-axis if using image coordinates

# plt.show()


'''
Microgradient
'''

# gradient arrow across entire region

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from skimage.filters import threshold_multiotsu, gaussian
from skimage.measure import regionprops, label, find_contours
from skimage.segmentation import relabel_sequential
from skimage.morphology import remove_small_objects
from skimage import img_as_ubyte

import csv

exported_points = []

# ---------------------------
# Step 1: Generate a Fake Reward Map
# ---------------------------
np.random.seed(42)
x, y = np.mgrid[0:100, 0:100]
reward_map = shear_strength_map[::10, ::10]  # Replace with your actual shear_strength_map
reward_map = gaussian(reward_map, sigma=1)

# ---------------------------
# Step 2: Multi-Otsu Thresholding
# ---------------------------
num_classes = 2 
thresholds = threshold_multiotsu(reward_map, classes=num_classes)
intensity_groups = np.digitize(reward_map, bins=thresholds)

# ---------------------------
# Step 3: Connected Component Labeling
# ---------------------------
final_labels = np.zeros_like(reward_map, dtype=int)
current_label = 1
for i in range(num_classes):
    mask = intensity_groups == i
    labeled_mask = label(mask, connectivity=2)
    labeled_mask[labeled_mask > 0] += current_label - 1
    final_labels[mask] = labeled_mask[mask]
    current_label = final_labels.max() + 1

regions = regionprops(final_labels)
for region in regions:
    print(f"Region {region.label} has area: {region.area} pixels")

# ---------------------------
# Step 4: Remove Small Regions
# ---------------------------
min_area = reward_map.shape[0] * reward_map.shape[1] * 0.005
labels_filtered = np.zeros_like(final_labels, dtype=int)
for region in regionprops(final_labels):
    if region.area >= min_area:
        labels_filtered[final_labels == region.label] = region.label

labels_filtered, _, _ = relabel_sequential(labels_filtered)
num_regions_filtered = labels_filtered.max()
print("Total number of regions after filtering:", num_regions_filtered)

# ---------------------------
# Step 5: Plot Overview
# ---------------------------
# fig, axes = plt.subplots(1, 3, figsize=(18, 6))
# axes[0].imshow(reward_map, cmap='viridis')
# axes[0].set_title('Fake Reward Map')
# axes[0].axis('off')
# # plt.imsave("reward_map.png", reward_map, cmap='viridis')

# axes[1].imshow(intensity_groups, cmap='nipy_spectral')
# axes[1].set_title('Intensity Groups (Multi-Otsu)')
# axes[1].axis('off')

# axes[2].imshow(labels_filtered, cmap='nipy_spectral')
# axes[2].set_title('Final Segmentation (Filtered)')
# axes[2].axis('off')
# plt.tight_layout()
# # plt.show()

# ---------------------------
# Step 6: Helper - Uniformly Sample Contours
# ---------------------------
def sample_contour_uniformly(contour, num_samples):
    distances = np.sqrt(np.sum(np.diff(contour, axis=0)**2, axis=1))
    cumulative_distance = np.concatenate(([0], np.cumsum(distances)))
    total_length = cumulative_distance[-1]
    sample_dists = np.linspace(0, total_length, num_samples)
    sample_rows = np.interp(sample_dists, cumulative_distance, contour[:, 0])
    sample_cols = np.interp(sample_dists, cumulative_distance, contour[:, 1])
    return np.vstack((sample_rows, sample_cols)).T

# ---------------------------
# Step 7: Draw Arrows Through and Across
# ---------------------------
line_length = 15
num_samples = 4

grad_y, grad_x = np.gradient(reward_map)

cmap = plt.cm.viridis
cmap_array = cmap(np.linspace(0, 1, cmap.N))
custom_cmap = cmap_array.copy()

last_region_label = np.max(labels_filtered)
norm = mcolors.Normalize(vmin=labels_filtered.min(), vmax=labels_filtered.max())
last_region_index = norm(last_region_label)
color_index = int(last_region_index * (cmap.N - 1))
custom_cmap[color_index, -1] = 0.0
transparent_cmap = mcolors.ListedColormap(custom_cmap)

fig2, ax2 = plt.subplots(figsize=(8, 8))
# ax2.imshow(reward_map, cmap='viridis')
ax2.imshow(labels_filtered, cmap=transparent_cmap)
ax2.set_title('Gradient Directions Across Region')
ax2.axis('on')
ax2.invert_yaxis()

for region_label in np.unique(labels_filtered):
    if region_label == 0:
        continue
    mask = labels_filtered == region_label
    contours = find_contours(mask.astype(float), level=0.5)

    if contours:
        contour = max(contours, key=len)
        sampled_coords = sample_contour_uniformly(contour, num_samples)

        for (row, col) in sampled_coords:
            r, c = int(round(row)), int(round(col))
            g_y = grad_y[r, c]
            g_x = grad_x[r, c]
            norm = np.hypot(g_y, g_x)
            if norm == 0:
                continue
            g_y /= norm
            g_x /= norm

            # One unit vector in both directions
            half_len = line_length
            end_r = row + half_len * g_y
            end_c = col + half_len * g_x
            start_r = row - half_len * g_y
            start_c = col - half_len * g_x

            # 1. Forward arrow (center → end)
            ax2.annotate('', xy=(end_c, end_r), xytext=(col, row),
                        arrowprops=dict(arrowstyle='->', color='blue', lw=1.5))

            # 2. Backward arrow flipped 180° around tail (start → flipped direction)
            flip_dx = col - start_c
            flip_dy = row - start_r
            flipped_head_c = start_c - flip_dx
            flipped_head_r = start_r - flip_dy
            ax2.annotate('', xy=(flipped_head_c, flipped_head_r), xytext=(start_c, start_r),
                        arrowprops=dict(arrowstyle='->', color='red', lw=1.5))

            # 3. connecting line between both ends
            ax2.plot([start_c, end_c], [start_r, end_r], color='green', lw=1, alpha=0.7)

            exported_points.append((end_c, end_r, flipped_head_c, flipped_head_r))    

plt.tight_layout()

# plt.show()


# ---------------------------
# Step 7: Export Arrow Data to CSV
# ---------------------------
with open("csv_data/microgradient.csv", "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["end_c", "end_r", "flipped_head_c", "flipped_head_r"])
    writer.writerows(exported_points)

print("Exported arrow points to 'microgradient.csv'")


'''
Baseline
'''

import numpy as np
from scipy.spatial.distance import pdist

def monte_carlo_maxmin(candidate_points, num_samples, iterations=2000):
    """
    From a set of candidate points, select num_samples points
    such that the minimum pairwise Euclidean distance is maximized,
    according to a Monte Carlo search.

    Parameters:
        candidate_points (ndarray): An (N, 2) array of (row, col) coordinates.
        num_samples (int): Number of points to sample.
        iterations (int): Number of Monte Carlo iterations.

    Returns:
        best_sample (ndarray): An (num_samples, 2) array of selected points.
        best_min_distance (float): The max (over iterations) of the min distance among the selected set.
    """
    best_sample = None
    best_min_distance = -1

    # If the candidate pool is smaller than the requested sample, just return all candidates.
    if candidate_points.shape[0] <= num_samples:
        return candidate_points, 0

    for _ in range(iterations):
        # randomly choose a set of num_samples points (without replacement)
        indices = np.random.choice(candidate_points.shape[0], size=num_samples, replace=False)
        sample = candidate_points[indices]
        # Compute all pairwise distances
        dists = pdist(sample)  
        # pdist returns a 1D array of all pairwise distances; we take its minimum as the quality measure.
        min_dist = dists.min()
        if min_dist > best_min_distance:
            best_min_distance = min_dist
            best_sample = sample.copy()  # store the sample
    return best_sample, best_min_distance


import csv

# Create candidate pool for the entire area: all pixel indices.
all_points = np.argwhere(np.ones(reward_map.shape, dtype=bool))  # shape (num_pixels, 2)
num_samples_area = 50  # desired number of sample points

# Perform Monte Carlo max–min sampling over the entire area.
sampled_points_area, quality_area = monte_carlo_maxmin(all_points, num_samples_area, iterations=2000)
print("Best min distance over entire area:", quality_area)

# Visualize the result.
plt.figure(figsize=(6,6))
plt.imshow(reward_map, cmap='viridis')
plt.scatter(sampled_points_area[:, 1], sampled_points_area[:, 0], 
            c='red', s=60, label='Sampled Points')
plt.title('Monte Carlo Sampling over Entire 2D Area')
plt.legend()
plt.gca().invert_yaxis()  # optional: flip y-axis if using image coordinates
plt.axis('on')
# plt.show()

# Save sampled points to CSV using the csv module
with open('csv_data/baseline.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['y', 'x'])  # write header
    for point in sampled_points_area:
        writer.writerow(point)

print("Saved sampled points to 'baseline.csv'.")



'''
Zone Coverage
'''

num_samples_region = int(50/len(np.unique(labels_filtered)))  # desired number of samples per region

print("labels_filtered shape (height, width):", labels_filtered.shape)
print("Number of samples per region:", num_samples_region)

region_samples = {}

# Loop over each region label (skip 0: background)
for region_label in np.unique(labels_filtered):
    if region_label == 0:
        continue
    region_mask = (labels_filtered == region_label)
    candidate_points_region = np.argwhere(region_mask)
    
    # Proceed only if there are enough candidate points.
    if candidate_points_region.shape[0] < num_samples_region:
        print(f"Region {region_label}: not enough candidate points, using all available.")
        region_samples[region_label] = candidate_points_region
    else:
        best_sample_region, quality_region = monte_carlo_maxmin(candidate_points_region, num_samples_region, iterations=2000)
        region_samples[region_label] = best_sample_region
        print(f"Region {region_label}: best min distance = {quality_region}")

# (Optional) Visualization: plot samples over each region.
plt.figure(figsize=(8,8))
plt.imshow(labels_filtered, cmap='nipy_spectral', origin='lower')
for region_label, samples in region_samples.items():
    plt.scatter(samples[:, 1], samples[:, 0], s=50, label=f'Region {region_label}')
plt.title('Monte Carlo Sampling per Region')
plt.legend()
# plt.axis('off')
# plt.gca().invert_yaxis()  # <-- This fixes the "flipped" Y-axis

# # plt.show()


# Save all region samples to a CSV file
with open("csv_data/zonecoverage.csv", mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["region_label", "y", "x"])  # column headers

    for region_label, samples in region_samples.items():
        for y, x in samples:
            writer.writerow([region_label, y, x])

print("Saved region sampled points to 'zonecoverage.csv'.")
