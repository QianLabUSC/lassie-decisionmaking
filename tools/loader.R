library(R.matlab)
library(rjson)
library(here)

inputFile <- "agu2022.mat"
outputFile <- "rhexDataset.json"

setwd("C:/Users/swu04/OneDrive/Documents/Kod Lab/Data/Datasets/SingleTransect_Agu2022")

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

moistureData <- data["mm"][1]
moistureData <- lapply(moistureData, function(v) { apply(v, 2, as.list) })
moistureData <- setPrecision(moistureData, precision);
names(moistureData) <- "moisture"

shearData <- data["y.H1"][1]
shearData <- lapply(shearData, function(v) { apply(v, 2, as.list) })
shearData <- setPrecision(shearData, precision);
names(shearData) <- "shear"

textResult <- toJSON(c(moistureData, shearData))

write(paste("export const dataset = ", textResult), "C:/Users/swu04/OneDrive/Documents/Kod Lab/Data/Output/SingleTransectDataset_Agu2022_12-1-21/rhexDataset.ts")