# DATA LOAD 

#load libs
require(jsonlite)
require(dplyr)
require(tibble)
require(tidyr)

#turn off sci-notation
options(scipen=999)


#CREATE FILES DF 
# df_files <- NA
# df_files$name 
# df_files$n_meta
# df_files$n_nav
# df_files$n_struct


#LOAD ONE LOG FILE 
logfile <- stream_in(file("logs/test_med.json"))
logdf <- data.frame(logfile$data$data)
logdf <- as_tibble(logdf)

#EXTRACT AND STRUCTURE META TABLE 
L <- logdf$tableName == "meta" #define logical vector
meta <- logdf[L,] %>% select("rows") #filter for 'meta' row
meta <- data.frame(meta$rows) #extract only "rows" col
meta <- meta %>% select(-X.types) # remove unecessary col 
meta <- meta  %>% unnest_wider(data) #un-nest data 
meta <- meta %>% select(-...1) # remove unecessary col 
meta <- meta  %>% unnest_wider(user, names_sep = "_") #un-nest user 
meta <- meta %>% select(-user_...1) # remove unecessary col 
meta$user_email <- meta$user_email[1]
meta$user_id <- meta$user_id[1]
meta$extension <- meta$extension[1]
meta$userAgent <- meta$userAgent[1]
meta <- as_tibble(meta)

#EXTRACT AND STRUCTURE STRUCTURE TABLE 
L <- logdf$tableName == "structure" #define logical vector
structure <- logdf[L,] %>% select("rows") #filter for 'structure' row
structure <- data.frame(structure$rows) #extract only "rows" col
structure$time <- structure$data$result$time #rename time 
structure$result <- structure$data$result$result #rename result
structure <- structure %>% select(-data) #remove nested col
structure <- as_tibble(structure)

#EXTRACT AND STRUCTURE NAVIGATION TABLE 
L <- logdf$tableName == "navigation" #define logical vector
nav <- logdf[L,] %>% select("rows") #filter for 'navigation' row
nav <- data.frame(nav$rows) #extract only "rows" col
nav <- as_tibble(nav)
