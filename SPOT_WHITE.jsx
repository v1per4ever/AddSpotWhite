/*
 * MIT License
 *
 * Copyright (c) 2025 Pavel Miroshnik t.me/script_design
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * Скрипт для создания плашечного канала Spot_White в Adobe Photoshop
 * Автоматизирует процесс подготовки изображения для печати с белым цветом
 */

// Устанавливаем единицы измерения в пиксели
app.preferences.rulerUnits = Units.PIXELS;

// ============================================================================
// ФУНКЦИИ ЗАГРУЗКИ ПРОЗРАЧНОСТИ СЛОЯ (ActionManager)
// ============================================================================

/**
 * Загружает прозрачность активного слоя в качестве выделения.
 * Использует синтаксис charIDToTypeID (cID).
 * Программный эквивалент CMD/Click по миниатюре слоя.
 */
function loadLayerTransparencyAsSelection_cID() {
    var idChnl = charIDToTypeID("Chnl");
    var actionSelect = new ActionReference();
    actionSelect.putProperty(idChnl, charIDToTypeID("fsel"));
    
    var actionTransparent = new ActionReference();
    actionTransparent.putEnumerated(idChnl, idChnl, charIDToTypeID("Trsp"));
    
    var actionDesc = new ActionDescriptor();
    actionDesc.putReference(charIDToTypeID("null"), actionSelect);
    actionDesc.putReference(charIDToTypeID("T "), actionTransparent);
    
    executeAction(charIDToTypeID("setd"), actionDesc, DialogModes.NO);
}

/**
 * Загружает прозрачность активного слоя в качестве выделения.
 * Использует синтаксис stringIDToTypeID (sID) для лучшей читаемости.
 * Программный эквивалент CMD/Click по миниатюре слоя.
 */
function loadLayerTransparencyAsSelection_sID() {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();

    // Цель: Установить свойство "selection"
    ref.putProperty(stringIDToTypeID("channel"), stringIDToTypeID("selection"));
    desc.putReference(stringIDToTypeID("null"), ref);

    // Источник: Взять данные из "transparencyEnum" (канал прозрачности слоя)
    var targetRef = new ActionReference();
    targetRef.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("channel"), stringIDToTypeID("transparencyEnum"));
    desc.putReference(stringIDToTypeID("to"), targetRef);

    // Выполнить действие: "set" (установить) без диалоговых окон
    executeAction(stringIDToTypeID("set"), desc, DialogModes.NO);
}

/**
 * Надежно загружает прозрачность указанного слоя в качестве выделения и проверяет успешность.
 * 
 * @param {ArtLayer} targetLayer - Объект слоя Photoshop, с которого загружается прозрачность.
 * @returns {boolean} - true, если выделение успешно создано, false в противном случае.
 */
function loadAndVerifyTransparencySelection(targetLayer) {
    // Проверка входных данных
    if (!targetLayer || typeof targetLayer.name === 'undefined') {
        alert("Ошибка: Передан неверный объект слоя.");
        return false;
    }

    var doc = app.activeDocument;

    // 1. Установка Контекста
    doc.activeLayer = targetLayer;

    // 2. Выполнение AM-Команды (используем sID версию)
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putProperty(stringIDToTypeID("channel"), stringIDToTypeID("selection"));
    desc.putReference(stringIDToTypeID("null"), ref);
    var targetRef = new ActionReference();
    targetRef.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("channel"), stringIDToTypeID("transparencyEnum"));
    desc.putReference(stringIDToTypeID("to"), targetRef);

    try {
        executeAction(stringIDToTypeID("set"), desc, DialogModes.NO);
    } catch (e) {
        // Это не должно произойти, но является хорошей практикой
        alert("Критическая ошибка ActionManager: " + e.message);
        return false;
    }

    // 3. Проверка Результата (Ключевой шаг)
    try {
        // Попытка получить границы. Вызовет ошибку, если выделения нет.
        var bounds = doc.selection.bounds;
        
        // Дополнительная проверка: bounds могут существовать, но быть "пустыми"
        if (bounds[0] == bounds[2] || bounds[1] == bounds[3]) {
            doc.selection.deselect(); // Очистка на всякий случай
            return false;
        }
        
        // Успех! Выделение существует и имеет размер.
        return true;
    } catch (e) {
        // Ожидаемая "ошибка" (поведение), если выделение не было создано (слой пуст).
        return false;
    }
}

/**
 * Расширенная функция для загрузки прозрачности с модификатором.
 * 
 * @param {ArtLayer} targetLayer - Целевой слой.
 * @param {string} modifierType - "REPLACE", "ADD", "SUBTRACT", "INTERSECT".
 * @returns {boolean} - true при успехе.
 */
function loadTransparencyWithModifier(targetLayer, modifierType) {
    if (!targetLayer || typeof targetLayer.name === 'undefined') {
        alert("Ошибка: Передан неверный объект слоя.");
        return false;
    }
    
    app.activeDocument.activeLayer = targetLayer;

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putProperty(stringIDToTypeID("channel"), stringIDToTypeID("selection"));
    desc.putReference(stringIDToTypeID("null"), ref);
    
    var targetRef = new ActionReference();
    targetRef.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("channel"), stringIDToTypeID("transparencyEnum"));
    desc.putReference(stringIDToTypeID("to"), targetRef);

    // --- ДОБАВЛЕНИЕ МОДИФИКАТОРА ---
    var modifierEnum;
    switch (modifierType.toUpperCase()) {
        case "ADD":
            modifierEnum = stringIDToTypeID("addToSelection");
            break;
        case "SUBTRACT":
            modifierEnum = stringIDToTypeID("subtractFromSelection");
            break;
        case "INTERSECT":
            modifierEnum = stringIDToTypeID("intersectWithSelection");
            break;
        case "REPLACE":
        default:
            // "REPLACE" является действием по умолчанию, ключ не нужен.
            break;
    }

    if (modifierEnum) {
        desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), modifierEnum);
    }
    
    try {
        executeAction(stringIDToTypeID("set"), desc, DialogModes.NO);
    } catch (e) {
        return false;
    }

    // Проверка результата
    try {
        var bounds = app.activeDocument.selection.bounds;
        if (bounds[0] == bounds[2] || bounds[1] == bounds[3]) {
            app.activeDocument.selection.deselect();
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

// ============================================================================
// ОСНОВНЫЕ ФУНКЦИИ СКРИПТА
// ============================================================================

// Функция для открытия файла PDF
function openPDFFile() {
    var file = File.openDialog("Выберите PDF файл для открытия", "PDF:*.pdf", false);
    if (file == null) {
        return null;
    }
    
    // Опции для открытия PDF
    var pdfOpenOptions = new PDFOpenOptions();
    pdfOpenOptions.antiAlias = true;
    pdfOpenOptions.mode = OpenDocumentMode.CMYK; // Открываем сразу в CMYK
    pdfOpenOptions.resolution = 300; // Разрешение 300 DPI
    pdfOpenOptions.suppressWarnings = true;
    pdfOpenOptions.page = 1; // Открываем первую страницу
    
    // Открываем PDF файл
    var doc = app.open(file, pdfOpenOptions);
    
    return doc;
}

/**
 * Функция для выделения только видимых пикселей (непрозрачных областей).
 * Использует надежный метод загрузки прозрачности слоя через ActionManager.
 * Это программный эквивалент CMD/Click по миниатюре слоя.
 * 
 * @param {Document} doc - Документ Photoshop.
 * @returns {boolean} - true, если выделение успешно создано, false в противном случае.
 */
function selectAllArea(doc) {
    // Проверяем наличие активного слоя
    if (!doc || !doc.activeLayer) {
        alert("Ошибка: Нет активного слоя в документе.");
        return false;
    }
    
    // Используем надежную функцию загрузки прозрачности слоя
    // Это загрузит все непрозрачные пиксели активного слоя в выделение
    var success = loadAndVerifyTransparencySelection(doc.activeLayer);
    
    if (!success) {
        // Если слой пуст или не содержит непрозрачных пикселей,
        // пытаемся выделить весь документ как fallback
        try {
            doc.selection.selectAll();
            // Проверяем, что выделение создано
            var bounds = doc.selection.bounds;
            if (bounds && bounds.length == 4) {
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }
    
    return true;
}

/**
 * Сжимает текущее выделение на указанное количество пикселей.
 * Использует ActionManager для надежного выполнения операции.
 * 
 * @param {Document} doc - Документ Photoshop.
 * @param {number} pixels - Количество пикселей для сжатия (по умолчанию 1).
 * @returns {boolean} - true, если операция выполнена успешно, false в противном случае.
 */
function contractSelection(doc, pixels) {
    if (!doc) {
        return false;
    }
    
    // Проверяем наличие активного выделения
    var hasSelection = false;
    try {
        var bounds = doc.selection.bounds;
        if (bounds && bounds.length == 4) {
            if (bounds[0] != bounds[2] && bounds[1] != bounds[3]) {
                hasSelection = true;
            }
        }
    } catch (e) {
        return false;
    }
    
    if (!hasSelection) {
        return false;
    }
    
    // Устанавливаем количество пикселей для сжатия (по умолчанию 1)
    if (typeof pixels === 'undefined' || pixels === null) {
        pixels = 1;
    }
    
    // Используем ActionManager для сжатия выделения
    try {
        var desc = new ActionDescriptor();
        desc.putUnitDouble(charIDToTypeID("By  "), charIDToTypeID("#Pxl"), pixels);
        executeAction(charIDToTypeID("Cntr"), desc, DialogModes.NO);
        
        // Проверяем, что выделение все еще существует после сжатия
        try {
            var newBounds = doc.selection.bounds;
            if (newBounds && newBounds.length == 4) {
                // Проверяем, что выделение не стало пустым
                if (newBounds[0] != newBounds[2] && newBounds[1] != newBounds[3]) {
                    return true;
                }
            }
        } catch (e) {
            // Выделение могло исчезнуть после сжатия
            return false;
        }
        
        return true;
    } catch (e) {
        // Если ActionManager не работает, пробуем альтернативный метод
        try {
            if (doc.selection.contract) {
                doc.selection.contract(pixels);
                return true;
            }
        } catch (e2) {
            return false;
        }
        return false;
    }
}

/**
 * Создает плашечный канал Spot_White на основе текущего выделения.
 * Выделение преобразуется в канал, который затем конвертируется в плашечный.
 * 
 * Для плашечного канала:
 * - Черный в канале = 100% покрытие белым при печати
 * - Белый в канале = 0% покрытие (прозрачно)
 * 
 * @param {Document} doc - Документ Photoshop.
 * @returns {Channel} - Созданный плашечный канал Spot_White.
 */
function createSpotWhiteChannel(doc) {
    // Проверяем, что документ в режиме CMYK
    if (doc.mode != DocumentMode.CMYK) {
        doc.changeMode(ChangeMode.CMYK);
    }
    
    // Проверяем наличие активного выделения
    var hasSelection = false;
    var selectionBounds = null;
    try {
        selectionBounds = doc.selection.bounds;
        if (selectionBounds && selectionBounds.length == 4) {
            // Проверяем, что выделение не пустое
            if (selectionBounds[0] != selectionBounds[2] && selectionBounds[1] != selectionBounds[3]) {
                hasSelection = true;
            }
        }
    } catch (e) {
        hasSelection = false;
    }
    
    if (!hasSelection) {
        throw new Error("Нет активного выделения для создания плашечного канала.");
    }
    
    // Сохраняем текущее состояние каналов
    var originalChannels = doc.activeChannels;
    
    // Сохраняем текущее выделение во временный альфа-канал
    // Это позволит нам восстановить его позже, даже если оно сложное (не прямоугольное)
    var tempChannel = null;
    try {
        tempChannel = doc.channels.add();
        doc.selection.store(tempChannel);
        // Теперь можем безопасно работать с выделением
    } catch (e) {
        // Если store не работает, используем альтернативный метод
        tempChannel = null;
    }
    
    // Создаем новый канал для плашечного цвета
    var newChannel = doc.channels.add();
    
    // Активируем только новый канал для редактирования
    doc.activeChannels = [newChannel];
    
    // Заливаем весь канал белым (0% покрытие белым = прозрачно)
    var whiteColor = new SolidColor();
    whiteColor.rgb.red = 255;
    whiteColor.rgb.green = 255;
    whiteColor.rgb.blue = 255;
    
    doc.selection.selectAll();
    doc.selection.fill(whiteColor);
    
    // Восстанавливаем оригинальное выделение
    if (tempChannel) {
        try {
            // Загружаем выделение из временного канала
            doc.selection.load(tempChannel, SelectionType.REPLACE);
        } catch (e) {
            // Если не удалось загрузить, используем bounds как fallback
            try {
                doc.selection.select(selectionBounds, SelectionType.REPLACE);
            } catch (e2) {
                throw new Error("Не удалось восстановить выделение для заполнения канала.");
            }
        }
    } else {
        // Fallback: используем bounds
        try {
            doc.selection.select(selectionBounds, SelectionType.REPLACE);
        } catch (e) {
            throw new Error("Не удалось восстановить выделение для заполнения канала.");
        }
    }
    
    // Заливаем выделенную область черным (100% покрытие белым)
    var blackColor = new SolidColor();
    blackColor.rgb.red = 0;
    blackColor.rgb.green = 0;
    blackColor.rgb.blue = 0;
    
    app.foregroundColor = blackColor;
    doc.selection.fill(blackColor);
    
    // Удаляем временный канал, если он был создан
    if (tempChannel) {
        try {
            tempChannel.remove();
        } catch (e) {
            // Игнорируем ошибку удаления временного канала
        }
    }
    
    // Устанавливаем цвет для плашечного канала (красный)
    var spotColor = new SolidColor();
    spotColor.rgb.red = 255;
    spotColor.rgb.green = 0;
    spotColor.rgb.blue = 0;
    
    // Конвертируем канал в плашечный
    newChannel.kind = ChannelType.SPOTCOLOR;
    newChannel.name = "Spot_White";
    newChannel.color = spotColor;
    newChannel.solidity = 100;
    
    // Восстанавливаем просмотр всех каналов CMYK + новый плашечный канал
    // Создаем массив каналов, включающий оригинальные каналы CMYK и новый плашечный канал
    try {
        var channelsArray = [];
        
        // Добавляем оригинальные каналы CMYK
        // originalChannels может быть массивом или объектом Channels
        if (originalChannels) {
            // Проверяем, является ли это массивом
            if (originalChannels.length !== undefined) {
                // Это массив или объект с length
                for (var i = 0; i < originalChannels.length; i++) {
                    try {
                        channelsArray.push(originalChannels[i]);
                    } catch (e) {
                        // Пропускаем каналы, которые не удалось добавить
                    }
                }
            } else {
                // Это может быть объект Channels (parent), добавляем все CMYK каналы вручную
                try {
                    channelsArray.push(doc.channels.getByName("Cyan"));
                    channelsArray.push(doc.channels.getByName("Magenta"));
                    channelsArray.push(doc.channels.getByName("Yellow"));
                    channelsArray.push(doc.channels.getByName("Black"));
                } catch (e) {
                    // Если не удалось получить каналы по имени, используем parent
                    var cmykChannels = doc.channels.getByName("Cyan").parent;
                    if (cmykChannels && cmykChannels.length !== undefined) {
                        for (var j = 0; j < cmykChannels.length; j++) {
                            try {
                                channelsArray.push(cmykChannels[j]);
                            } catch (e2) {
                                // Пропускаем
                            }
                        }
                    }
                }
            }
        } else {
            // Если originalChannels пуст, добавляем все CMYK каналы
            try {
                channelsArray.push(doc.channels.getByName("Cyan"));
                channelsArray.push(doc.channels.getByName("Magenta"));
                channelsArray.push(doc.channels.getByName("Yellow"));
                channelsArray.push(doc.channels.getByName("Black"));
            } catch (e) {
                // Если не удалось получить каналы по имени, используем parent
                var allChannels = doc.channels.getByName("Cyan").parent;
                if (allChannels && allChannels.length !== undefined) {
                    for (var k = 0; k < allChannels.length; k++) {
                        try {
                            channelsArray.push(allChannels[k]);
                        } catch (e2) {
                            // Пропускаем
                        }
                    }
                }
            }
        }
        
        // Добавляем новый плашечный канал к списку видимых каналов
        channelsArray.push(newChannel);
        
        // Устанавливаем активные каналы (включая новый плашечный)
        doc.activeChannels = channelsArray;
    } catch (e) {
        // Если не удалось установить каналы с новым плашечным, 
        // пытаемся показать все каналы (включая плашечные)
        try {
            // Показываем все каналы документа (CMYK + плашечные)
            var allDocChannels = [];
            for (var m = 0; m < doc.channels.length; m++) {
                try {
                    allDocChannels.push(doc.channels[m]);
                } catch (e3) {
                    // Пропускаем
                }
            }
            if (allDocChannels.length > 0) {
                doc.activeChannels = allDocChannels;
            }
        } catch (e2) {
            // Игнорируем ошибку, если не удалось установить каналы
        }
    }
    
    return newChannel;
}

// Функция для заливки канала черным цветом (100% белого при печати)
function fillChannelWithBlack(doc, channel) {
    // Сохраняем текущее состояние каналов
    var originalChannels = doc.activeChannels;
    
    // Активируем только канал Spot_White для редактирования
    doc.activeChannels = [channel];
    
    // Устанавливаем цвет переднего плана в черный (для плашечного канала черный = 100% белого)
    var blackColor = new SolidColor();
    blackColor.rgb.red = 0;
    blackColor.rgb.green = 0;
    blackColor.rgb.blue = 0;
    
    app.foregroundColor = blackColor;
    
    // Заливаем выделенную область черным цветом в канале Spot_White
    // В плашечных каналах черный цвет означает 100% покрытие белым
    doc.selection.fill(blackColor);
    
    // Возвращаемся к просмотру всех каналов CMYK
    doc.activeChannels = originalChannels;
}

// Функция для сохранения файла в формате TIFF
function saveAsTIFF(doc, originalFile) {
    // Создаем диалог сохранения файла
    var saveFile = File.saveDialog("Сохранить как TIFF", "TIFF:*.tif");
    if (saveFile == null) {
        return null;
    }
    
    // Убеждаемся, что расширение .tif
    var fileName = String(saveFile.name);
    if (fileName.toLowerCase().indexOf(".tif") == -1) {
        // Если расширения нет, добавляем его
        var filePath = saveFile.fsName;
        if (filePath.lastIndexOf(".") > filePath.lastIndexOf("/")) {
            // Есть расширение, но не .tif - заменяем
            filePath = filePath.substring(0, filePath.lastIndexOf(".")) + ".tif";
        } else {
            // Нет расширения - добавляем
            filePath = filePath + ".tif";
        }
        saveFile = new File(filePath);
    }
    
    // Опции для сохранения TIFF
    var tiffOptions = new TiffSaveOptions();
    tiffOptions.embedColorProfile = true;
    tiffOptions.imageCompression = TIFFEncoding.TIFFLZW; // LZW сжатие изображения
    tiffOptions.layerCompression = LayerCompression.ZIP; // ZIP сжатие слоев (медленное сохранение, файлы малого размера)
    tiffOptions.transparency = false; // Сохранить прозрачность - НЕ выбрано
    tiffOptions.spotColors = true; // Важно: сохраняем плашечные каналы
    tiffOptions.alphaChannels = false; // Не сохраняем альфа-каналы отдельно
    tiffOptions.annotations = false;
    tiffOptions.saveImagePyramid = false;
    
    // Дополнительные настройки TIFF (если поддерживаются):
    // Порядок пикселов: Перемежающийся (RGBRGB) - устанавливается автоматически
    // Формат: Macintosh - устанавливается автоматически
    
    // Сохраняем файл
    doc.saveAs(saveFile, tiffOptions);
    
    return saveFile;
}

// Основная функция выполнения скрипта
function main() {
    try {
        // Шаг 1: Открытие файла
        var doc = openPDFFile();
        if (doc == null) {
            alert("Файл не выбран. Операция отменена.");
            return;
        }
        
        // Сохраняем оригинальный файл для создания имени сохранения (если доступен)
        var originalFile = null;
        try {
            if (doc.fullName != null && doc.fullName != undefined) {
                originalFile = doc.fullName;
            }
        } catch (e) {
            // fullName может быть недоступен для некоторых типов документов
            originalFile = null;
        }
        
        // Шаг 2: Выделение области печати (загрузка прозрачности активного слоя)
        // Используем надежный метод через ActionManager
        var selectionSuccess = selectAllArea(doc);
        
        if (!selectionSuccess) {
            alert("Ошибка: Не удалось создать выделение из прозрачности слоя.\n\nВозможные причины:\n- Слой пуст или не содержит непрозрачных пикселей\n- Проблема с активным слоем\n\nПопытка выделить весь документ...");
            
            // Fallback: пытаемся выделить весь документ
            try {
                doc.selection.selectAll();
                var bounds = doc.selection.bounds;
                if (!bounds || bounds.length != 4) {
                    alert("Критическая ошибка: Не удалось создать выделение. Операция прервана.");
                    return;
                }
            } catch (e) {
                alert("Критическая ошибка: Не удалось создать выделение.\n\nОшибка: " + e.message);
                return;
            }
        }
        
        // Шаг 2.1: Сжатие выделения на 1 пиксель
        try {
            var contractSuccess = contractSelection(doc, 1);
            if (!contractSuccess) {
                // Если сжатие не удалось, но выделение существует, продолжаем работу
                // (возможно, выделение слишком маленькое для сжатия)
            }
        } catch (e) {
            // Если произошла ошибка при сжатии, продолжаем работу с исходным выделением
            // Не прерываем выполнение скрипта
        }
        
        // Убеждаемся, что выделение видимо и активно
        // Принудительно обновляем вид документа
        try {
            if (doc.mode == DocumentMode.CMYK) {
                doc.activeChannels = doc.channels.getByName("Cyan").parent; // Показываем все каналы CMYK
            } else {
                // Если еще не в CMYK, показываем все каналы RGB
                doc.activeChannels = doc.channels.getByName("Red").parent;
            }
        } catch (e) {
            // Если не удалось установить каналы, просто продолжаем
        }
        doc.activeLayer = doc.activeLayer; // Обновляем активный слой
        
        // Шаг 3: Перевод в CMYK (если еще не в CMYK)
        if (doc.mode != DocumentMode.CMYK) {
            doc.changeMode(ChangeMode.CMYK);
        }
        
        // Шаг 4: Создание плашечного канала Spot_White на основе выделения
        // Функция createSpotWhiteChannel автоматически заполняет канал:
        // - Выделенная область = черный (100% покрытие белым при печати)
        // - Не выделенная область = белый (0% покрытие, прозрачно)
        try {
            var spotChannel = createSpotWhiteChannel(doc);
        } catch (e) {
            alert("Ошибка при создании плашечного канала:\n" + e.message);
            doc.selection.deselect();
            return;
        }
        
        // Снимаем выделение (канал уже создан и заполнен)
        doc.selection.deselect();
        
        // Шаг 6: Сохранение файла в формате TIFF
        var savedFile = saveAsTIFF(doc, originalFile);
        
        if (savedFile != null) {
            // Закрываем сохраненный файл в Photoshop
            doc.close(SaveOptions.DONOTSAVECHANGES);
        } else {
            alert("Сохранение отменено пользователем.");
        }
        
    } catch (e) {
        alert("Произошла ошибка:\n" + e.message + "\n\nСтрока: " + e.line);
    }
}

// Запуск скрипта
main();

