library(R.matlab)
library(rjson)
library(here)

inputFile <- "new_global_dataset_v2.0_grainfix.mat"
outputFile <- "rhexDataset.json"

setwd("C:/Users/swu04/OneDrive/Documents/Kod Lab/Data/Datasets/NewDataset-V2.0/NewDataset-V2.0")

data <-readMat(inputFile)

# Data cleanup

setPrecision <- function(data, precision) {
  if (is.list(data)) {
    return (lapply(data, function(i) { setPrecision(i, precision) }));
  } else {
    return(as.numeric(formatC(data, digits = 2, format = "f")))
  }
}

precision <- 2

moistureData <- data["transect.moisture.range"][[1]]
moistureData <- lapply(moistureData, function(v) { apply(v[[1]], 2, as.list) })
moistureData <- setPrecision(moistureData, precision);

shear0Data <- data["transect.y.range.H0"][[1]]
shear0Data <- lapply(shear0Data, function(v) { apply(v[[1]], 2, as.list) })
shear0Data <- setPrecision(shear0Data, precision);

shear1Data <- data["transect.y.range.H1"][[1]]
shear1Data <- lapply(shear1Data, function(v) { apply(v[[1]], 2, as.list) })
shear1Data <- setPrecision(shear1Data, precision);

grain1Data <- data["grain.size.distribution.global.h1"][[1]]
grain1Data <- lapply(grain1Data, function(v) { apply(v[[1]], 2, as.list) })
grain1Data <- setPrecision(grain1Data, precision);

grain2Data <- data["grain.size.distribution.global.h2"][[1]]
grain2Data <- lapply(grain2Data, function(v) { apply(v[[1]], 2, as.list) })
grain2Data <- setPrecision(grain2Data, precision);

result <- list(moistureData, shear0Data, shear1Data, grain1Data, grain2Data);
names(result) <- list("moisture", "shear0", "shear1", "grain1", "grain2")

textResult <- toJSON(result)

write(paste("export const dataset = ", textResult), "C:/Users/swu04/OneDrive/Documents/Kod Lab/Data/Output/NewDataset-V2.0_GrainFix_11-3-21/rhexDataset.ts")