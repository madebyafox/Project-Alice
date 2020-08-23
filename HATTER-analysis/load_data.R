

#CONFIGURATION

#load libs
require(tidyverse) #all things
require(jsonlite) #JSON import
require(tibble)
require(tidyr)
library(dbplyr)
library(DBI) #https://cran.r-project.org/web/packages/DBI/vignettes/spec.html
library(odbc)

#options
options(scipen=999) #turn off sci-notation
options(stringsAsFactors=FALSE) #for some unnesting txns
setwd("~/Sites/RESEARCH/ProjectAlice/Project-Alice/HATTER-analysis") #set working dir

#include custom functions
source("functions.R")

#CONNECT to database
con <- DBI::dbConnect(odbc::odbc(),
                      Driver   = "/usr/local/mysql-connector-odbc-8.0.21-macos10.15-x86-64bit/lib/libmyodbc8a.so",
                      Server   = "127.0.0.1",
                      Database = "hatter",
                      # UID      = rstudioapi::askForPassword("Database user"),
                      # PWD      = rstudioapi::askForPassword("Database password"),
                      UID = "ruser",
                      PWD = "ruser",
                      Port     = 3306)

list.files("./logs")

#LOAD all files in ./logs dir
LOADALL()


##TODO | import only new files 

##TODO | problems with efault values.
#investigate int vs double vals and how they are imported to the dB when NULL

##TODO | import files as transaction, so transactions are rolled back unless all 5 tables are successful 






