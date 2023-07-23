'''
This file is the tools for gaussian estimation. 
'''


import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C, WhiteKernel

"""
Perform Gaussian Process Regression on 1D data and make predictions on new
data points.

Args:
    x (1-d array): Array containing the x values of the data points.
    y (1-d array): Array containing the y values of the data points.
    prediction_range (1-d array): Array with x values of new data points.
    optimizer (string or None): Optimizer for kernel optimization.
    noise_level (float): Noise level parameter for the WhiteKernel.
    length_scale (float): Length scale parameter for the RBF kernel.
    sigma_f (float): Amplitude parameter for the RBF kernel.

Returns:
    tuple: A tuple with the following elements:
        y_pred (1-d array): Predicted y values for new data points.
        information (1-d array): Information gain for each prediction.
        y_std (1-d array): Standard deviation of the predictions.

Examples:
    >>> x_data = np.array([1, 2, 3])
    >>> y_data = np.array([1, 4, 6])
    >>> prediction_range = np.array([4, 5, 6])
    >>> optimizer = 'fmin_l_bfgs_b'
    >>> noise_level = 1e-3
    >>> length_scale = 1.0
    >>> sigma_f = 1.0
    >>> y_pred, information, y_std = Gaussian_Estimation(x_data, y_data,
    ...     prediction_range, optimizer, noise_level, length_scale, sigma_f)
"""


def Gaussian_Estimation(x, y, prediction_range,  optimizer, noise_level, length_scale, sigma_f):

    # Define the kernel
    noise_level = noise_level
    length_scale = length_scale
    sigma_f = sigma_f * sigma_f
    kernel = C(sigma_f) * RBF(length_scale) + WhiteKernel(noise_level)

    # Instantiate the Gaussian Process Regressor
    if(not optimizer):
        gp = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=0, random_state=0, optimizer=None)
    else:
        gp = GaussianProcessRegressor(kernel=kernel)
    x = np.array([x])
    x = x.T
    # Fit the model to the data
    gp.fit(x, y)

    # Make predictions on new data points
    X_new = np.array([prediction_range])
    X_new = X_new.T
    y_pred, y_std = gp.predict(X_new, return_std=True)
    information = np.exp(-np.square(y_std))
    return y_pred, information, y_std

if __name__ == "__main__":
    # X = np.array([3,     7,    10,    13,    16,    19,
    #     3,     7,    10 ,   13,    16,    19,
    #     3 ,    7,    10,    13,    16,    19,
    #     3,     7,    10 ,   13,    16,    19])
    X = np.array([3,     3,    3,    3,    10,    10,
        10,     10,    10 ,   16,    16,    16,
        16,   19 ,   19,    19,    19])
    y = np.array([0.0992,    2.0124,   0.6216,    1.3204,    9.1036,    7.4650,
        8.7138,    8.5359,    9.8502,    7.4650 ,   7.2727,    8.5219,
        8.7138,    6.4378,    8.7138 ,   6.3152,8.5036 ])
    # y = np.array([0.0992,    7.2285,    9.1036,    7.8270,    7.5175,    6.6421,
    #     2.0124,    8.6191,    9.8502,    7.4650 ,   7.2727,    8.5219,
    #     0.6216,    6.4378,    8.7138 ,   6.3152 ,   6.4360,    9.2684,
    #     1.3204,    7.0980,    8.5359 ,   7.8082 ,  8.5036 ,    7.4663,])

    y_pred, information_gaussian, y_std = Gaussian_Estimation(X,  y,   np.linspace(1, 22, 220), False, 0.2, 4, 3)
    print(y_std)
    window_size =41
    half_window = window_size // 2  # integer division to get half window size
    information_gaussian = 1 - information_gaussian
    # create an empty array to store the result
    information_gaussian1 = np.empty_like(information_gaussian)
    # iter/ate over the array
    for i in range(len(information_gaussian)):
        # calculate start and end of window
        start = max(0, i - half_window)
        end = min(len(information_gaussian), i + half_window + 1)
        
        # calculate sum and divide by actual window size
        information_gaussian1[i] = information_gaussian[start:end].sum() / window_size

    # Plot the results (optional)
    import matplotlib.pyplot as plt

    plt.figure()
    plt.scatter(X, y, c='k', label='Data')
    plt.plot(np.linspace(1, 22, 220), y_pred, label='Prediction')
    plt.fill_between(np.linspace(1, 22, 220).ravel(), y_pred - 1.96*y_std, y_pred + 1.96*y_std, alpha=0.5, color='k', label='Uncertainty')
    plt.legend()

    plt.figure()
    plt.plot(np.linspace(1, 22, 220), information_gaussian1)
    plt.legend()
    plt.show()

