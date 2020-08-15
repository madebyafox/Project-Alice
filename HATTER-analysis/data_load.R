# DATA LOAD 

#CONFIGURATION
#load libs
require(jsonlite)
# require(dplyr)
#require (dbplyr)
# require(tibble)
# require(tidyr)
require(tidyverse)

#turn off sci-notation
options(scipen=999)
options(stringsAsFactors=FALSE)

#SET WORKING DIRECTORY 
setwd("~/Sites/RESEARCH/ProjectAlice/Project-Alice/HATTER-analysis")



#FUNCTION LOADFILE (takes single filename extracts 3 df)
LOADFILE <- function(filename)
{
  
  file = paste("logs/",filename,sep = "")
  warning("LOADING | ", file)
  
  #LOAD ONE LOG FILE 
  logfile <- stream_in(file(file))
  logdf <- data.frame(logfile$data$data)
  logdf <- as_tibble(logdf)  
  
  #DISCOVER TABLE DIMENSIONS
  n_nav = dim(logdf$rows[[1]])
  n_nav = n_nav[1]
  n_struct = dim(logdf$rows[[2]])
  n_struct = n_struct[1]
  n_meta = dim(logdf$rows[[3]])
  n_meta = n_meta[1]
  
  #CHECK TABLE LENGTHS
  n_nav = length(logdf$rows[[1]])
  n_struct = length(logdf$rows[[2]])
  n_meta = length(logdf$rows[[3]])
  
  if(n_meta == 0) stop("PROBLEM! No content in meta import: ",file )
  
  #EXTRACT AND STRUCTURE META TABLE 
  L <- logdf$tableName == "meta" #define logical vector
  df_meta <- logdf[L,] %>% select("rows") #filter for 'meta' row
  df_meta <- data.frame(df_meta$rows) #extract only "rows" col
  
  if (is.null(df_meta$X.types) == FALSE)
  { df_meta <- df_meta %>% select(-X.types) # remove unecessary col 
  }
  
  if (is.data.frame(df_meta$data))
  {
    df_meta$email <- df_meta$data$user$email[1]
    df_meta$user <- df_meta$data$user$id[1]
    df_meta$extension <- df_meta$data$extension[1]
    df_meta$userAgent <- df_meta$data$userAgent[1]
    df_meta <- df_meta %>% select(-data)
  } else if (is.list(df_meta$data))
  {
    df_meta <- df_meta  %>% unnest_wider(data) #un-nest data 
    df_meta <- df_meta %>% select(-...1) # remove unecessary col 
    df_meta <- df_meta  %>% unnest_wider(user, names_sep = "_") #un-nest user 
    df_meta <- df_meta %>% select(-user_...1) # remove unecessary col 
    df_meta$email <- df_meta$user_email[1]
    df_meta$user <- df_meta$user_id[1]
    df_meta <- df_meta %>% select(-user_email) # remove unecessary col 
    df_meta <- df_meta %>% select(-user_id) # remove unecessary col 
    df_meta$extension <- df_meta$extension[1]
    df_meta$userAgent <- df_meta$userAgent[1]
  }
  df_meta <- as_tibble(df_meta)
  
  if (is.null (df_meta$id)) {stop("PROBLEM | No event in meta : ",file) } 
  if (is.null (df_meta$handler)) {stop("PROBLEM | No handler in meta : ",file) } 
  if (is.null (df_meta$event)) {stop("PROBLEM | No event in meta : ",file) } 
  if (is.null (df_meta$email)) {stop("PROBLEM | No email in meta : ",file) } 
  if (is.null (df_meta$user)) {stop("PROBLEM | No user in meta : ",file) } 
  if (is.null (df_meta$extension)) {stop("PROBLEM | No extension# in meta : ",file) } 
  if (is.null (df_meta$userAgent)) {stop("PROBLEM | No userAgent in meta : ",file) } 
  if (is.null (df_meta$result)) {df_meta$result <- NA
  warning("Setting meta result to NULL: ", file)} 
  
  #EXTRACT AND STRUCTURE STRUCTURE TABLE 
  if (n_struct !=0 ){
    L <- logdf$tableName == "structure" #define logical vector
    df_structure <- logdf[L,] %>% select("rows") #filter for 'structure' row
    df_structure <- data.frame(df_structure$rows) #extract only "rows" col
    df_structure$user <- df_meta$user[1]
    df_structure$time <- df_structure$data$result$time #rename time 
    df_structure$result <- df_structure$data$result$result #rename result
    df_structure <- df_structure %>% select(-data) #remove nested col
    df_structure <- as_tibble(df_structure)
    
    #CHECK TABLE STRUCTURE
    if (is.null (df_structure$id)) {stop("PROBLEM | No id in structure : ",file) } 
    if (is.null (df_structure$handler)) {stop("PROBLEM | No handler in structure : ",file) } 
    if (is.null (df_structure$event)) {stop("PROBLEM | No event in structure : ",file) } 
    if (is.null (df_structure$user)) {stop("PROBLEM | No user in structure : ",file) } 
    if (is.null (df_structure$time)) {stop("PROBLEM | No time in structure : ",file) } 
    if (is.null (df_structure$result)) {stop("PROBLEM | No result in structure : ",file) } 
  }
  
  
  #EXTRACT AND STRUCTURE NAVIGATION TABLE 
  if (n_nav !=0 ){
    L <- logdf$tableName == "navigation" #define logical vector
    df_navigation <- logdf[L,] %>% select("rows") #filter for 'navigation' row
    df_navigation <- data.frame(df_navigation$rows) #extract only "rows" col
    df_navigation$user <- df_meta$user[1]
    df_navigation <- as_tibble(df_navigation)
    
    #CHECK TABLE STRUCTURE
    if (is.null (df_navigation$id)) {stop("PROBLEM | No id in nav : ",file) } 
    if (is.null (df_navigation$handler)) {stop("PROBLEM | No handler in nav : ",file) } 
    if (is.null (df_navigation$event)) {stop("PROBLEM | No event in nav : ",file) } 
    if (is.null (df_navigation$user)) {stop("PROBLEM | No user in nav : ",file) } 
    if (is.null (df_navigation$data)) {df_navigation$data <- NA
    warning("Setting nav data to NULL: ", file)} 
  }
  
  #UPDATE files table
  user = df_meta$user[1]
  start = df_meta$id[1]
  end = df_meta$id[nrow(df_meta)]
  files <- list(filename, user, start, end, n_meta, n_nav, n_struct)
  names(files) <- list("file", "user", "start", "end", "n_meta", "n_nav", "n_struct")
  t(files)
  
  return (dfs <- list (files, df_meta, df_structure, df_navigation))
}

#RECEIVE PAYLOAD AND ADD TO EXISTING DFS 
LOAD <- function(filename){
  print(filename)
  latest <- LOADFILE(filename)
  # df_files <- rbind(df_files,data.frame(latest[1]))
  # df_meta <- rbind(df_meta, data.frame(latest[2]))
  # df_structure <- rbind(df_structure, data.frame(latest[3]))
  # df_navigation <- rbind(df_navigation, data.frame(latest[4]))
  # return (dfs <- list (df_files, df_meta, df_structure, df_navigation))
  return (latest)
}

#SETUP EMPTY DFS 
df_files <- data.frame()
df_meta <- data.frame()
df_structure <- data.frame()
df_navigation <- data.frame()

files = list.files("./logs")

dfs <- lapply (files, FUN=LOAD)

#ADD LOADED DATA TO DFS 
for (i in seq_along(dfs)) {
  
  #is current file already added?
  currFile = dfs[[i]][[1]]$file 
  
  if ( sum(str_detect(df_files$file,currFile)) == 0 ) #file name not in df_files
  {
    print(paste("files",i))
    df_files <- rbind(df_files, dfs[[i]][[1]])
    print(paste("meta",i))
    df_meta <- rbind(df_meta, dfs[[i]][[2]])
    print(paste("structure",i))
    df_structure <- rbind(df_structure, dfs[[i]][[3]])
    print(paste("nav",i))
    df_navigation <- rbind(df_navigation, dfs[[i]][[4]])
  }
  else (warning ("WARNING | DUPLICATE File? ", currFile))
}



library(dbplyr)
library(DBI)
library(odbc)



#connect to dabase
con <- DBI::dbConnect(odbc::odbc(),
                      Driver   = "/usr/local/mysql-connector-odbc-8.0.21-macos10.15-x86-64bit/lib/libmyodbc8a.so",
                      Server   = "127.0.0.1",
                      Database = "hatter",
                      UID      = rstudioapi::askForPassword("Database user"),
                      PWD      = rstudioapi::askForPassword("Database password"),
                      Port     = 3306)

dbListTables(con)

data <- dbWriteTable(con, "files", df_files, append = TRUE)
data <- dbWriteTable(con, "meta", df_meta, append = TRUE)
data <- dbWriteTable(con, "structure", df_structure, append = TRUE)
data <- dbWriteTable(con, "navigation", df_navigation, append = TRUE)

dbReadTable(con, "files")
dbReadTable(con, "meta")
dbReadTable(con, "navigation")

rs <- dbSendStatement(
  con,
  "INSERT INTO structure VALUES df_structure"
)
dbHasCompleted(rs)
dbGetRowsAffected(rs)
dbClearResult(rs)
dbReadTable(con, "structure")





dbWriteTable(con, "CARS", head(cars, 3))

rs <- dbSendStatement(
  con,
  "INSERT INTO CARS (speed, dist) VALUES (1, 1), (2, 2), (3, 3)"
)
dbHasCompleted(rs)
dbGetRowsAffected(rs)
dbClearResult(rs)
dbReadTable(con, "CARS")
dbReadTable(con, "files")
dbReadTable(con, "cans")



dbWriteTable(con, "widget", head(cars, 3))
dbReadTable(con, "widget")   # there are 3 rows
dbExecute(
  con,
  "INSERT INTO widget (speed, dist) VALUES (1, 1), (2, 2), (3, 3)"
)
dbReadTable(con, "widget")   # there are now 6 rows

